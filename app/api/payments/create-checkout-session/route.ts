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
    const result = await createMyposCheckoutSession(orderData, locale);
    
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
