import crypto from 'crypto';
import { Session } from 'express-session';

export function generateCodeVerifier(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

export function generateCodeChallenge(codeVerifier: string): string {
  return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
}

// Store code verifier in session
export function storeCodeVerifier(session: Session, codeVerifier: string) {
  (session as Session & { pkceCodeVerifier?: string }).pkceCodeVerifier = codeVerifier;
}

// Retrieve code verifier from session
export function getCodeVerifier(session: Session): string | undefined {
  return (session as Session & { pkceCodeVerifier?: string }).pkceCodeVerifier;
}

