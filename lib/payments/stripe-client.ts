import Stripe from 'stripe';
import { getStripeSecretKey } from './stripe-config';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error('Stripe is not configured. Missing STRIPE_SECRET_KEY in env variables.');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2026-06-24.dahlia' as any,
      typescript: true,
    });
  }

  return stripeClient;
}
