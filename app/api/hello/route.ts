import { NextResponse } from 'next/server'
import { adminGate } from '@/lib/admin'

export async function GET() {
  const denied = await adminGate()
  if (denied) return denied
  return NextResponse.json({ hello: 'world' })
}
