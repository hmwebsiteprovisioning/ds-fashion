import { NextResponse } from 'next/server';
import { fulfillStripeCheckout } from '@/lib/payments/fulfill-stripe-checkout';
import { getStripeWebhookSecret } from '@/lib/payments/stripe-config';
import { getStripeClient } from '@/lib/payments/stripe-client';

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid webhook signature';
    console.error('❌ Webhook signature verification failed:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.log(`🔔 Stripe Webhook Received event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const sessionId = session.id;
    const pendingCheckoutId = session.metadata?.pendingCheckoutId;

    console.log(`⚙️ Processing checkout completion for Session: ${sessionId}`);

    try {
      const fulfilled = await fulfillStripeCheckout(sessionId, pendingCheckoutId);
      if (fulfilled) {
        console.log(`✅ Fulfill checkout success: Order ${fulfilled.orderId} created/retrieved.`);
      } else {
        console.log(`⚠️ Stripe session not fulfilled (unpaid or resolved payload empty).`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fulfillment crashed';
      console.error('❌ Webhook fulfillment failed:', message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
