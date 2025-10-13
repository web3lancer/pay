import { NextResponse } from 'next/server';
import { PasskeyServer } from '@/lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { email, credentialData, challenge } = await req.json();

    if (!email || !credentialData || !challenge) {
      return NextResponse.json(
        { error: 'Email, credentialData, and challenge are required' },
        { status: 400 }
      );
    }

    const passkeyServer = new PasskeyServer();
    const result = await passkeyServer.registerPasskey(email, credentialData, challenge);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
