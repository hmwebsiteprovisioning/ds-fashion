import crypto from 'crypto';
import { getMyposConfig, type MyposConfig } from './mypos-config';

export const MYPOS_ENDPOINTS = {
  production: 'https://www.mypos.com/vmp/checkout',
  sandbox: 'https://www.mypos.com/vmp/checkout-test',
} as const;

/**
 * Concatenates parameter values with '-', base64 encodes the result,
 * and signs with SHA-256 using the merchant RSA private key.
 */
export function signMyposData(
  params: Record<string, string | number | undefined | null>,
  privateKeyPem: string
): string {
  // Extract values in exact order of keys provided, excluding Signature itself if present
  const values: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (key === 'Signature' || val === undefined || val === null) continue;
    values.push(String(val));
  }

  const concatenated = values.join('-');
  const base64Concatenated = Buffer.from(concatenated, 'utf8').toString('base64');

  const signer = crypto.createSign('SHA256');
  signer.update(base64Concatenated, 'utf8');
  signer.end();

  return signer.sign(privateKeyPem, 'base64');
}

/**
 * Verifies incoming notification/response signature from myPOS using the myPOS Public Certificate.
 */
export function verifyMyposSignature(
  params: Record<string, string | number | undefined | null>,
  signature: string,
  publicCertPem: string
): boolean {
  if (!signature || !publicCertPem) {
    return false;
  }

  try {
    const values: string[] = [];
    for (const [key, val] of Object.entries(params)) {
      if (key === 'Signature' || val === undefined || val === null) continue;
      values.push(String(val));
    }

    const concatenated = values.join('-');
    const base64Concatenated = Buffer.from(concatenated, 'utf8').toString('base64');

    const verifier = crypto.createVerify('SHA256');
    verifier.update(base64Concatenated, 'utf8');
    verifier.end();

    return verifier.verify(publicCertPem, signature, 'base64');
  } catch (err) {
    console.error('Error verifying myPOS signature:', err);
    return false;
  }
}

export function getMyposCheckoutUrl(env: 'production' | 'sandbox'): string {
  return MYPOS_ENDPOINTS[env] || MYPOS_ENDPOINTS.production;
}
