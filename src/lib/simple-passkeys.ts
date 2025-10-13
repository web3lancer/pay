import { account } from './appwrite-client';

// Simple utility functions for WebAuthn
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function publicKeyCredentialToJSON(pubKeyCred: any): any {
  if (Array.isArray(pubKeyCred)) {
    return pubKeyCred.map(publicKeyCredentialToJSON);
  }
  if (pubKeyCred instanceof ArrayBuffer) {
    return bufferToBase64Url(pubKeyCred);
  }
  if (pubKeyCred && typeof pubKeyCred === 'object') {
    const obj: any = {};
    for (const key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
    }
    return obj;
  }
  return pubKeyCred;
}

export class SimplePasskeyAuth {
  constructor() {
    // No function URL needed - using Next.js API routes
  }

  async register(email: string): Promise<{ success: boolean; token?: any; error?: string }> {
    if (!('credentials' in navigator)) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    try {
      // Generate registration options
      const options = await this.generateRegistrationOptions(email);
      
      // Create credential
      const credential = await navigator.credentials.create({ publicKey: options });
      if (!credential) {
        return { success: false, error: 'Credential creation failed' };
      }

      // Convert to JSON
      const credentialJSON = publicKeyCredentialToJSON(credential);

      // Send to Next.js API route for verification and storage
      const response = await fetch('/api/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          credentialData: credentialJSON,
          challenge: options.challenge
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      // Exchange token for session
      if (result.token?.secret) {
        await account.createSession({
          userId: result.token.userId,
          secret: result.token.secret
        });
      }

      return { success: true, token: result.token };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async authenticate(email: string): Promise<{ success: boolean; token?: any; error?: string }> {
    if (!('credentials' in navigator)) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    try {
      // Generate authentication options
      const options = await this.generateAuthenticationOptions(email);
      
      // Get assertion
      const assertion = await navigator.credentials.get({ publicKey: options });
      if (!assertion) {
        return { success: false, error: 'Authentication failed' };
      }

      // Convert to JSON
      const assertionJSON = publicKeyCredentialToJSON(assertion);

      // Send to Next.js API route for verification
      const response = await fetch('/api/passkey/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          assertion: assertionJSON,
          challenge: options.challenge
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Authentication failed' };
      }

      // Exchange token for session
      if (result.token?.secret) {
        await account.createSession({
          userId: result.token.userId,
          secret: result.token.secret
        });
      }

      return { success: true, token: result.token };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async generateRegistrationOptions(email: string): Promise<any> {
    const rpName = process.env.NEXT_PUBLIC_RP_NAME || 'Appwrite Passkey';
    const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
    
    // Create deterministic user ID from email
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const userId = new Uint8Array(hashBuffer);

    return {
      rp: { name: rpName, id: rpID },
      user: {
        id: userId,
        name: email,
        displayName: email
      },
      challenge: bufferToBase64Url(crypto.getRandomValues(new Uint8Array(32))),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      attestation: 'none',
      timeout: 60000
    };
  }

  private async generateAuthenticationOptions(email: string): Promise<any> {
    const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
    
    return {
      challenge: bufferToBase64Url(crypto.getRandomValues(new Uint8Array(32))),
      rpId: rpID,
      timeout: 60000,
      userVerification: 'preferred'
      // Note: allowCredentials will be determined by the function based on stored passkeys
    };
  }

  async signOut(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.warn('Sign out error:', error);
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }
}