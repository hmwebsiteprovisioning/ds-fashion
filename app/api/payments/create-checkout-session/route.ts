import { NextResponse } from 'next/server';
import { createMyposCheckoutSession } from '@/lib/payments/create-mypos-session';
import { isMyposConfigured } from '@/lib/payments/mypos-config';
import type { OrderData } from '@/lib/orders';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isMyposConfigured()) {
    return NextResponse.json({ success: false, error: 'myPOS payments are not configured' }, { status: 503 });
  }

  const orderData = body as OrderData;

  // Basic validation
  if (!orderData.customer?.firstName || !orderData.customer?.telephone || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0 || !orderData.totals?.total) {
    return NextResponse.json({ success: false, error: 'Missing required order details' }, { status: 400 });
  }

  try {
    const locale = orderData.customer.country === 'Bulgaria' || orderData.customer.country === 'България' ? 'bg' : 'bg';

    // Detect public host / protocol dynamically from incoming request
    const origin = request.headers.get('origin') || request.headers.get('referer');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    let detectedUrl: string | undefined;
    if (origin) {
      try {
        detectedUrl = new URL(origin).origin;
      } catch {
        detectedUrl = undefined;
      }
    }
    if (!detectedUrl && host) {
      detectedUrl = `${proto}://${host}`;
    }

    const result = await createMyposCheckoutSession(orderData, locale, detectedUrl);
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.sessionId,
        formUrl: result.formUrl,
        formData: result.formData,
        url: result.formUrl, // Compatibility alias
      },
    });
  } catch (err) {
    console.error('Failed to create myPOS checkout session:', err);
    const message = err instanceof Error ? err.message : 'myPOS checkout session generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
