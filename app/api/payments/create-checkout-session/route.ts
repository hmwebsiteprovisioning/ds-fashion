import { NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '@/lib/payments/create-stripe-session';
import { isStripeConfigured } from '@/lib/payments/stripe-config';
import type { OrderData } from '@/lib/orders';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ success: false, error: 'Stripe payments are not configured' }, { status: 503 });
  }

  const orderData = body as OrderData;

  // Basic validation
  if (!orderData.customer?.firstName || !orderData.customer?.telephone || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0 || !orderData.totals?.total) {
    return NextResponse.json({ success: false, error: 'Missing required order details' }, { status: 400 });
  }

  try {
    const locale = orderData.customer.country === 'Bulgaria' || orderData.customer.country === 'България' ? 'bg' : 'en';
    const { sessionId, url } = await createStripeCheckoutSession(orderData, locale);
    return NextResponse.json({ success: true, data: { sessionId, url } });
  } catch (err) {
    console.error('Failed to create Stripe checkout session:', err);
    const message = err instanceof Error ? err.message : 'Checkout session generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
