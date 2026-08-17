import { NextRequest, NextResponse } from 'next/server';
import { getMyposConfig } from '@/lib/payments/mypos-config';
import { verifyMyposSignature } from '@/lib/payments/mypos-client';
import { fulfillMyposCheckout } from '@/lib/payments/fulfill-mypos-checkout';

export async function POST(request: NextRequest) {
  try {
    const config = getMyposConfig();
    if (!config) {
      console.error('❌ [myPOS Webhook] myPOS is not configured.');
      return new NextResponse('Configuration error', { status: 500 });
    }

    // Parse incoming POST parameters (can be form-urlencoded or form-data)
    const contentType = request.headers.get('content-type') || '';
    const params: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        params[key] = String(value);
      });
    } else {
      // Fallback to text urlencoded parsing
      const text = await request.text();
      const searchParams = new URLSearchParams(text);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    console.log('🔔 [myPOS Webhook] Received notification:', {
      method: params.IPCmethod,
      orderId: params.OrderID,
      status: params.Status,
      statusMsg: params.StatusMsg,
      trnref: params.IPC_Trnref,
      amount: params.Amount,
      currency: params.Currency,
    });

    const signature = params.Signature;
    if (!signature) {
      console.error('❌ [myPOS Webhook] Missing Signature header/field');
      return new NextResponse('Missing signature', { status: 400 });
    }

    // Verify signature using myPOS Public Certificate if configured
    if (config.publicCertificate) {
      const isValid = verifyMyposSignature(params, signature, config.publicCertificate);
      if (!isValid) {
        console.error('❌ [myPOS Webhook] Invalid signature verification');
        return new NextResponse('Invalid signature', { status: 400 });
      }
      console.log('✅ [myPOS Webhook] Signature verified successfully');
    } else {
      console.warn('⚠️ [myPOS Webhook] Skipping signature verification (MYPOS_PUBLIC_CERTIFICATE not set)');
    }

    const orderId = params.OrderID;
    const status = params.Status;
    const trnref = params.IPC_Trnref;

    // Status "0" indicates successful payment in myPOS IPC protocol
    if (status === '0') {
      if (!orderId) {
        console.error('❌ [myPOS Webhook] Missing OrderID in notification');
        return new NextResponse('Missing OrderID', { status: 400 });
      }

      const result = await fulfillMyposCheckout(orderId, trnref);
      if (result) {
        console.log(`✅ [myPOS Webhook] Successfully processed order ${result.orderId}`);
      } else {
        console.warn(`⚠️ [myPOS Webhook] Could not fulfill order for session: ${orderId}`);
      }
    } else {
      console.log(`ℹ️ [myPOS Webhook] Non-successful payment status (${status}): ${params.StatusMsg || 'Declined'}`);
    }

    // myPOS requires exact response "OK" with HTTP 200
    return new NextResponse('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    console.error('❌ [myPOS Webhook] Unexpected error handling notification:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('myPOS Webhook endpoint is active', { status: 200 });
}
