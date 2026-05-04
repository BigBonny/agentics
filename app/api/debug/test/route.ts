import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple test: API is working')
    return NextResponse.json({ 
      message: 'API is working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json(
      { error: 'API failed', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Simple POST test: API is working')
    const body = await request.json()
    return NextResponse.json({ 
      message: 'POST API is working',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Simple POST test error:', error)
    return NextResponse.json(
      { error: 'POST API failed', details: error.message },
      { status: 500 }
    )
  }
}
