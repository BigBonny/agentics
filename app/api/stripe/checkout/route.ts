import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSessionWithPrice, createCustomer } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/clerk'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Stripe Checkout API',
    method: 'POST required',
    usage: 'Send POST request with { priceId, tier } in body'
  })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
    }

    const { tier } = await request.json()
    if (!tier || !['premium', 'center'].includes(tier)) {
      return NextResponse.json({
        error: 'Missing or invalid tier',
        required: ['tier'],
      }, { status: 400 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json({ error: 'Email utilisateur introuvable' }, { status: 400 })
    }

    // Retrouve (ou crée) le customer Stripe associé au compte pour que le
    // webhook puisse rattacher le paiement au bon utilisateur.
    let { data: dbUser } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('clerk_id', user.id)
      .single()

    let customerId = dbUser?.stripe_customer_id as string | undefined
    if (!customerId) {
      const customer = await createCustomer(email, `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || email)
      customerId = customer.id
      if (dbUser) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', dbUser.id)
      }
    }

    const amount = tier === 'center' ? 49 : 19
    const session = await createCheckoutSessionWithPrice(customerId, email, amount, 'eur', {
      clerk_id: user.id,
    })

    console.log('Checkout session created:', session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
