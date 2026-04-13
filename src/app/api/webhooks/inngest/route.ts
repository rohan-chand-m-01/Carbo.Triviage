import { NextRequest, NextResponse } from 'next/server'

// Simple Inngest webhook handler for now - will be expanded later
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Inngest webhook endpoint is available'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Inngest webhook received:', body)
    
    return NextResponse.json({ 
      status: 'received',
      message: 'Webhook processed successfully'
    })
  } catch (error) {
    console.error('Inngest webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
