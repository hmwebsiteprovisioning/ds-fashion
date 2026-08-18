import { NextResponse } from 'next/server';
import { getOrderBySessionId, getPendingCheckoutById } from '@/lib/payments/pending-checkout';
import { fulfillMyposCheckout } from '@/lib/payments/fulfill-mypos-checkout';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'session_id is required' }, { status: 400 });
  }

  try {
    // 1. Check if order was already generated in database
    const existing = await getOrderBySessionId(sessionId);
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

    // 2. Check pending checkout state
    const pending = await getPendingCheckoutById(sessionId);
    if (pending) {
      if (pending.status === 'completed' && pending.orderId) {
        return NextResponse.json({
          success: true,
          data: {
            status: 'complete',
            orderNumber: pending.orderId,
            orderId: pending.orderId,
            paid: true,
          },
        });
      }

      // Auto-fulfill as fallback (e.g. when webhook didn't arrive or testing)
      try {
        const fulfilled = await fulfillMyposCheckout(sessionId);
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
      } catch (fulfillErr) {
        console.error('Fallback fulfillment error in session-status:', fulfillErr);
      }

      return NextResponse.json({
        success: true,
        data: {
          status: 'pending',
          paid: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'pending',
        paid: false,
      },
    });
  } catch (err) {
    console.error('Session lookup failed:', err);
    const message = err instanceof Error ? err.message : 'Session lookup failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
