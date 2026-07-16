import Stripe from 'stripe';
import { getStripeClient } from './stripe-client';
import {
  attachStripeSessionToPendingCheckout,
  createPendingCheckout,
} from './pending-checkout';
import { resolveOrderItems, type OrderData } from '@/lib/orders';

function eurToStripeCents(totalEur: number): number {
  return Math.round(totalEur * 100);
}

export async function createStripeCheckoutSession(
  input: OrderData,
  locale: 'bg' | 'en' = 'bg'
): Promise<{ sessionId: string; url: string }> {
  // Resolve product IDs to variant IDs
  input.items = await resolveOrderItems(input.items);

  // 1. Create the pending checkout database record
  const pending = await createPendingCheckout(input);

  const stripe = getStripeClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const successUrl = `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/checkout?payment=cancelled`;

  // 2. Build line items
  // Since items in input might not have product names directly (only IDs), we fallback to generic Bulgarian labels,
  // but if the cart items pass 'name', we use it.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    input.items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        unit_amount: eurToStripeCents(item.price || 0),
        product_data: {
          name: item.name || (locale === 'bg' ? 'Артикул' : 'Product Item'),
        },
      },
      quantity: item.quantity,
    }));

  // Add delivery cost line item if greater than zero
  if (input.totals.delivery > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        unit_amount: eurToStripeCents(input.totals.delivery),
        product_data: {
          name: locale === 'bg' ? 'Доставка' : 'Delivery',
        },
      },
      quantity: 1,
    });
  }

  // Add discount line item if discount exists
  if (input.discount && input.discount.amount > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        unit_amount: eurToStripeCents(-input.discount.amount),
        product_data: {
          name: locale === 'bg' ? `Отстъпка (${input.discount.code})` : `Discount (${input.discount.code})`,
        },
      },
      quantity: 1,
    });
  }

  // 3. Request Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: input.customer.email?.trim() || undefined,
    metadata: {
      pendingCheckoutId: pending.id,
      locale: locale,
    },
    locale: locale === 'en' ? 'en' : 'bg',
  });

  if (!session.url) {
    throw new Error('Stripe checkout session URL is missing');
  }

  // 4. Binds the generated Stripe session ID to the pending record for webhook mapping
  await attachStripeSessionToPendingCheckout(pending.id, session.id);

  return { sessionId: session.id, url: session.url };
}
