import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

// Defensive: Ensure required environment variables are set at runtime
const requiredEnvVars = [
  'BRIDGE_API_KEY',
  'NEXT_PUBLIC_APPWRITE_ENDPOINT'
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] || typeof process.env[envVar] !== 'string') {
    // eslint-disable-next-line no-console
    console.error(`[Startup] Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// GET /api/payment-requests/[id] - Get payment request for bridge
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const paymentRequest = await DatabaseService.getPaymentRequest(requestId)
    
    if (!paymentRequest) {
      return NextResponse.json(
        { error: 'Payment request not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(paymentRequest)
  } catch (error) {
    console.error('Error fetching payment request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/payment-requests/[id] - Update payment request from bridge
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const updates = await request.json()
    
    // Validate bridge authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !isValidBridgeAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await DatabaseService.updatePaymentRequest(requestId, updates)
    
    // Log the bridge update
    await DatabaseService.createSecurityLog({
      userId: 'bridge',
      action: 'payment_request_updated_by_bridge',
      ipAddress: getClientIP(request),
      success: true,
      riskScore: 0,
      metadata: JSON.stringify({
        requestId,
        updates,
        source: 'bless_network'
      })
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating payment request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isValidBridgeAuth(authHeader: string): boolean {
  if (!authHeader || typeof authHeader !== 'string') return false;
  // Extract bearer token
  const token = authHeader.replace('Bearer ', '');
  // Validate against your bridge API key
  const validBridgeToken = process.env.BRIDGE_API_KEY;
  if (!validBridgeToken || typeof validBridgeToken !== 'string') return false;
  return token === validBridgeToken;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}