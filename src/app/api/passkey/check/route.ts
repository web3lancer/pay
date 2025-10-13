import { NextResponse } from 'next/server';
import { PasskeyServer } from '@/lib/passkey-server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const passkeyServer = new PasskeyServer();
    const passkeys = await passkeyServer.getPasskeysByEmail(email);

    return NextResponse.json({
      hasPasskeys: passkeys.length > 0,
      count: passkeys.length
    });
  } catch (error) {
    console.error('Check passkeys error:', error);
    return NextResponse.json(
      { hasPasskeys: false, count: 0 },
      { status: 200 } // Return 200 even on error, with hasPasskeys: false
    );
  }
}
