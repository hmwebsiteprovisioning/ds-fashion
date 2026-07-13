import { NextResponse } from 'next/server';
import { fulfillStripeCheckout } from '@/lib/payments/fulfill-stripe-checkout';
import { getOrderByStripeSessionId } from '@/lib/payments/pending-checkout';
import { getStripeClient } from '@/lib/payments/stripe-client';
import { isStripeConfigured } from '@/lib/payments/stripe-config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'session_id is required' }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ success: false, error: 'Stripe payments are not configured' }, { status: 503 });
  }

  try {
    // 1. Return immediately if order already generated in database (optimization)
    const existing = await getOrderByStripeSessionId(sessionId);
    if (existing) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'complete',
          orderNumber: existing.orderNumber,
          orderId: existing.orderId,
          paid: true,
        },
      });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Fulfill order on user landing page checks (redundancy fallback for webhooks)
    if (session.payment_status === 'paid') {
      const fulfilled = await fulfillStripeCheckout(
        sessionId,
        session.metadata?.pendingCheckoutId
      );

      if (fulfilled) {
        return NextResponse.json({
          success: true,
          data: {
            status: 'complete',
            orderNumber: fulfilled.orderNumber,
            orderId: fulfilled.orderId,
            paid: true,
          },
        });
      }
    }

    if (session.status === 'expired') {
      return NextResponse.json({
        success: true,
        data: { status: 'expired', paid: false },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: session.payment_status === 'unpaid' ? 'pending' : session.status,
        paid: session.payment_status === 'paid',
      },
    });
  } catch (err) {
    console.error('Session lookup failed:', err);
    const message = err instanceof Error ? err.message : 'Session lookup failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
