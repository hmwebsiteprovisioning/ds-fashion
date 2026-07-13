import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { randomUUID } from 'crypto';
import type { OrderData } from '@/lib/orders';

export type PendingCheckoutStatus = 'pending' | 'completed' | 'expired';

export interface PendingCheckoutRecord {
  id: string;
  stripeSessionId: string | null;
  payload: OrderData;
  status: PendingCheckoutStatus;
  orderId: string | null;
}

const memoryPending = new Map<string, PendingCheckoutRecord>();

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createPendingCheckout(
  payload: OrderData
): Promise<PendingCheckoutRecord> {
  const id = randomUUID();
  const record: PendingCheckoutRecord = {
    id,
    stripeSessionId: null,
    payload,
    status: 'pending',
    orderId: null,
  };

  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('pending_checkouts').insert({
      id,
      payload,
      status: 'pending',
    });

    if (error) {
      console.error('Failed to create pending checkout record:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  } else {
    memoryPending.set(id, record);
  }

  return record;
}

export async function attachStripeSessionToPendingCheckout(
  pendingCheckoutId: string,
  stripeSessionId: string
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('pending_checkouts')
      .update({ stripe_session_id: stripeSessionId })
      .eq('id', pendingCheckoutId);

    if (error) {
      console.error('Failed to attach Stripe session to pending checkout:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
    return;
  }

  const record = memoryPending.get(pendingCheckoutId);
  if (record) {
    record.stripeSessionId = stripeSessionId;
    memoryPending.set(pendingCheckoutId, record);
  }
}

export async function getPendingCheckoutById(
  id: string
): Promise<PendingCheckoutRecord | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('pending_checkouts')
      .select('id, stripe_session_id, payload, status, order_id')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      stripeSessionId: data.stripe_session_id,
      payload: data.payload as unknown as OrderData,
      status: data.status as PendingCheckoutStatus,
      orderId: data.order_id,
    };
  }

  return memoryPending.get(id) ?? null;
}

export async function getPendingCheckoutByStripeSession(
  stripeSessionId: string
): Promise<PendingCheckoutRecord | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('pending_checkouts')
      .select('id, stripe_session_id, payload, status, order_id')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      stripeSessionId: data.stripe_session_id,
      payload: data.payload as unknown as OrderData,
      status: data.status as PendingCheckoutStatus,
      orderId: data.order_id,
    };
  }

  for (const record of memoryPending.values()) {
    if (record.stripeSessionId === stripeSessionId) {
      return record;
    }
  }
  return null;
}

export async function markPendingCheckoutCompleted(
  pendingCheckoutId: string,
  orderId: string
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    await supabase
      .from('pending_checkouts')
      .update({ status: 'completed', order_id: orderId })
      .eq('id', pendingCheckoutId);
    return;
  }

  const record = memoryPending.get(pendingCheckoutId);
  if (record) {
    record.status = 'completed';
    record.orderId = orderId;
    memoryPending.set(pendingCheckoutId, record);
  }
}

export async function getOrderByStripeSessionId(
  stripeSessionId: string
): Promise<{ orderId: string; orderNumber: string } | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('orderid, orderid') // Wait! In public.orders table schema, the primary key column name is "orderid"!
    // Let's verify: Yes, in schema.txt: orderid text NOT NULL, and primary key (orderid).
    // So the column names are: "orderid" (order ID) and we also return it as orderNumber.
    // Wait, let's select "orderid"!
    .eq('stripe_checkout_session_id', stripeSessionId)
    .maybeSingle();

  if (error || !data) return null;

  return { orderId: data.orderid, orderNumber: data.orderid };
}
