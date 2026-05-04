import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const createCheckoutSessionWithPrice = async (
  customerId: string | null,
  userEmail: string,
  amount: number,
  currency: string = 'eur'
) => {
  try {
    const sessionParams: any = {
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Abonnement Premium - Agentics Révision',
              description: 'Accès illimité à toutes les fonctionnalités IA',
              images: [], // Add product images if available
            },
            unit_amount: amount * 100, // Convert to cents
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        type: 'subscription',
      },
    }

    // Only add customer if it exists
    if (customerId) {
      sessionParams.customer = customerId
    } else {
      sessionParams.customer_email = userEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return session
  } catch (error) {
    console.error('Error creating checkout session with price:', error)
    throw error
  }
}

export const createCustomer = async (email: string, name?: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'agentics-revision',
      },
    })
    return customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

export const getSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw error
  }
}

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export const createPrice = async (
  amount: number,
  currency: string,
  interval: 'month' | 'year',
  productId: string
) => {
  try {
    const price = await stripe.prices.create({
      unit_amount: amount,
      currency,
      recurring: { interval },
      product: productId,
    })
    return price
  } catch (error) {
    console.error('Error creating price:', error)
    throw error
  }
}

export const verifyWebhookSignature = (payload: string, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    return event
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    throw error
  }
}
