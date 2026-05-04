import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/stripe'
import { updateUserSubscription } from '@/lib/clerk'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    console.log('🔔 Webhook received:', { 
      signature: signature ? 'present' : 'missing',
      contentType: request.headers.get('content-type'),
      bodyLength: body.length 
    })

    if (!signature) {
      console.error('❌ No Stripe signature')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const event = verifyWebhookSignature(body, signature)
    console.log('✅ Webhook signature verified, event type:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const customerId = session.customer
        const subscriptionId = session.subscription

        console.log('💳 Payment completed:', { customerId, subscriptionId })

        // Find user by Stripe customer ID
        const { data: userData } = await supabase
          .from('users')
          .select('clerk_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userData) {
          // Update user subscription in Clerk
          await updateUserSubscription(userData.clerk_id, {
            tier: 'premium',
            status: 'active',
            stripeSubscriptionId: subscriptionId,
            customerId: customerId
          })

          // Update user in Supabase
          await supabase
            .from('users')
            .update({
              subscription_tier: 'premium',
              subscription_status: 'active',
              stripe_subscription_id: subscriptionId
            })
            .eq('clerk_id', userData.clerk_id)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        const customerId = invoice.customer

        console.log('💳 Invoice payment succeeded:', { subscriptionId, customerId })

        // If no subscriptionId, try to find user by customerId
        if (!subscriptionId && customerId) {
          console.log('⚠️ No subscriptionId, trying customerId')
          const { data: userData } = await supabase
            .from('users')
            .select('clerk_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (userData) {
            await supabase
              .from('users')
              .update({
                subscription_tier: 'premium',
                subscription_status: 'active'
              })
              .eq('clerk_id', userData.clerk_id)

            await updateUserSubscription(userData.clerk_id, {
              tier: 'premium',
              status: 'active'
            })
            console.log('✅ Updated user via customerId')
          }
        } else if (subscriptionId) {
          // Update subscription status
          const { data: userData } = await supabase
            .from('users')
            .select('clerk_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single()

          if (userData) {
            await supabase
              .from('users')
              .update({ subscription_status: 'active' })
              .eq('clerk_id', userData.clerk_id)

            await updateUserSubscription(userData.clerk_id, {
              status: 'active'
            })
            console.log('✅ Updated user via subscriptionId')
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription

        console.log('❌ Invoice payment failed:', { subscriptionId })

        // Update subscription status
        const { data: userData } = await supabase
          .from('users')
          .select('clerk_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (userData) {
          await supabase
            .from('users')
            .update({ subscription_status: 'cancelled' })
            .eq('clerk_id', userData.clerk_id)

          await updateUserSubscription(userData.clerk_id, {
            status: 'cancelled'
          })
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId = subscription.customer

        const { data: userData } = await supabase
          .from('users')
          .select('clerk_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userData) {
          await supabase
            .from('users')
            .update({
              subscription_tier: 'free',
              subscription_status: 'cancelled',
              stripe_subscription_id: null
            })
            .eq('clerk_id', userData.clerk_id)

          await updateUserSubscription(userData.clerk_id, {
            tier: 'free',
            status: 'cancelled',
            stripeSubscriptionId: null
          })
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
