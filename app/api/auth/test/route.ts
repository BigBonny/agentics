import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/clerk'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ 
        message: 'No authenticated user found',
        authenticated: false
      }, { status: 401 })
    }

    return NextResponse.json({ 
      message: 'User is authenticated',
      authenticated: true,
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { 
        error: 'Auth test failed', 
        details: error.message
      },
      { status: 500 }
    )
  }
}
