import { NextResponse } from 'next/server';
import { PasskeyServer } from '@/lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { email, assertion, challenge } = await req.json();

    if (!email || !assertion || !challenge) {
      return NextResponse.json(
        { error: 'Email, assertion, and challenge are required' },
        { status: 400 }
      );
    }

    const passkeyServer = new PasskeyServer();
    const result = await passkeyServer.authenticatePasskey(email, assertion, challenge);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
