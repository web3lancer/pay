import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

// Defensive: Ensure required environment variables are set at runtime
const requiredEnvVars = ['BRIDGE_API_KEY', 'DATABASE_URL']; // Add any others used by DatabaseService
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] || typeof process.env[envVar] !== 'string') {
    // eslint-disable-next-line no-console
    console.error(`[Startup] Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// POST /api/escrow/release - Handle escrow release notifications from bridge
export async function POST(request: NextRequest) {
  try {
    const { escrowId, transactionHash, milestoneId, network, timestamp } = await request.json()
    
    // Validate bridge authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !isValidBridgeAuth(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Log the escrow release event
    await DatabaseService.createSecurityLog({
      userId: 'bridge',
      action: 'escrow_released_on_bless_network',
      ipAddress: getClientIP(request),
      success: true,
      riskScore: 0,
      metadata: JSON.stringify({
        escrowId,
        transactionHash,
        milestoneId,
        network,
        timestamp
      })
    })
    
    // You could also update any related payment requests or user notifications here
    // For example, if you track escrow status in your database:
    /*
    await DatabaseService.updateEscrowStatus(escrowId, {
      status: milestoneId ? 'milestone_released' : 'fully_released',
      releasedAt: new Date(timestamp).toISOString(),
      blessTransactionHash: transactionHash
    })
    */
    
    return NextResponse.json({ 
      success: true,
      message: 'Escrow release notification received'
    })
  } catch (error) {
    console.error('Error handling escrow release:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function isValidBridgeAuth(authHeader: string): boolean {
  if (!authHeader || typeof authHeader !== 'string') return false;
  const token = authHeader.replace('Bearer ', '');
  const validBridgeToken = process.env.BRIDGE_API_KEY;
  // Defensive: ensure validBridgeToken is defined and a string
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