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
    // Temporarily skip authentication for testing
    console.log('Creating checkout session (no auth check for testing)')

    const { tier } = await request.json()

    // Validate required fields
    if (!tier) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['tier']
      }, { status: 400 })
    }

    console.log('Creating checkout session:', { tier })

    // Create checkout session with dynamic price - no customer needed
    const session = await createCheckoutSessionWithPrice(
      null, // No customer ID, let Stripe create one
      'test@example.com',
      19, // 19 EUR for premium subscription
      'eur'
    )

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
