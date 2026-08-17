import { NextResponse } from 'next/server';
import { getMyposConfig } from '@/lib/payments/mypos-config';
import { signMyposData, verifyMyposSignature, getMyposCheckoutUrl } from '@/lib/payments/mypos-client';

export async function GET(request: Request) {
  const origin = request.headers.get('origin') || request.headers.get('referer');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const detectedUrl = origin || (host ? `${proto}://${host}` : 'unknown');

  const config = getMyposConfig();

  if (!config) {
    return NextResponse.json({
      status: 'error',
      message: 'myPOS is NOT configured. One or more required environment variables are missing.',
      envCheck: {
        MYPOS_CLIENT_NUMBER: !!process.env.MYPOS_CLIENT_NUMBER,
        MYPOS_STORE_ID: !!process.env.MYPOS_STORE_ID,
        MYPOS_KEY_INDEX: !!process.env.MYPOS_KEY_INDEX,
        MYPOS_ENVIRONMENT: process.env.MYPOS_ENVIRONMENT || 'production (default)',
        MYPOS_CURRENCY: process.env.MYPOS_CURRENCY || 'EUR (default)',
        MYPOS_PRIVATE_KEY: !!process.env.MYPOS_PRIVATE_KEY,
        MYPOS_PUBLIC_CERTIFICATE: !!process.env.MYPOS_PUBLIC_CERTIFICATE,
      },
      detectedRequestUrl: detectedUrl,
    }, { status: 500 });
  }

  // Test RSA signing
  let signSuccess = false;
  let signError: string | null = null;
  let testSignature = '';

  const testPayload = {
    IPCmethod: 'IPCPurchase',
    IPCVersion: '1.4',
    IPCLanguage: 'BG',
    SID: config.storeId,
    WalletNumber: config.clientNumber,
    KeyIndex: config.keyIndex,
    Currency: config.currency,
    Amount: '10.00',
    OrderID: 'test-diagnostic-001',
  };

  try {
    testSignature = signMyposData(testPayload, config.privateKey);
    signSuccess = testSignature.length > 50;
  } catch (err) {
    signError = err instanceof Error ? err.message : String(err);
  }

  // Test certificate verification if provided
  let verifySuccess: boolean | null = null;
  let verifyError: string | null = null;

  if (config.publicCertificate && testSignature) {
    try {
      verifySuccess = verifyMyposSignature(testPayload, testSignature, config.publicCertificate);
    } catch (err) {
      verifyError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    status: 'ok',
    message: 'myPOS Configuration Diagnostic Check',
    diagnostics: {
      environment: config.environment,
      checkoutUrl: getMyposCheckoutUrl(config.environment),
      storeId: config.storeId,
      clientNumber: config.clientNumber,
      keyIndex: config.keyIndex,
      currency: config.currency,
      privateKeyConfigured: !!config.privateKey,
      privateKeyLength: config.privateKey.length,
      publicCertConfigured: !!config.publicCertificate,
      publicCertLength: config.publicCertificate?.length || 0,
      rsaSigningTest: signSuccess ? 'PASSED' : `FAILED: ${signError}`,
      rsaVerifyTest: verifySuccess !== null ? (verifySuccess ? 'PASSED' : 'FAILED (Signature did not match public cert)') : 'NOT TESTED (Cert not provided)',
      detectedBaseUrl: detectedUrl,
      expectedNotifyWebhook: `${detectedUrl}/api/webhooks/mypos`,
      expectedSuccessReturn: `${detectedUrl}/checkout/success?session_id=...`,
      expectedCancelReturn: `${detectedUrl}/checkout?payment=cancelled`,
    },
    sampleSignedPayload: {
      ...testPayload,
      Signature: testSignature ? `${testSignature.substring(0, 30)}...` : 'NONE',
    },
  });
}
