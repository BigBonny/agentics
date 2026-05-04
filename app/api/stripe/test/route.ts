import { NextRequest, NextResponse } from 'next/server'
import { createCustomer } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/clerk'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test creating a customer
    const customer = await createCustomer(
      user.emailAddresses[0].emailAddress,
      `${user.firstName || ''} ${user.lastName || ''}`.trim()
    )

    return NextResponse.json({ 
      message: 'Stripe is working',
      customerId: customer.id,
      userEmail: user.emailAddresses[0].emailAddress
    })
  } catch (error) {
    console.error('Stripe test error:', error)
    return NextResponse.json(
      { 
        error: 'Stripe test failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    )
  }
}
