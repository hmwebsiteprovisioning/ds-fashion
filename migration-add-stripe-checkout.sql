-- 1. Add paymentmethod and stripe_checkout_session_id columns to orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS paymentmethod text DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;

-- 2. Create partial unique index on stripe_checkout_session_id for idempotency checks
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_checkout_session_id_uidx 
  ON public.orders (stripe_checkout_session_id) 
  WHERE stripe_checkout_session_id IS NOT NULL;

-- 3. Create pending_checkouts table to save order payload before Stripe redirect
CREATE TABLE IF NOT EXISTS public.pending_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'completed', 'expired')),
  order_id text, -- references orders(orderid)
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Create index on status for faster lookup
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_status ON public.pending_checkouts (status);

-- Enable Row Level Security (RLS) on pending_checkouts
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (or admin client access)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.pending_checkouts;
CREATE POLICY "Enable read access for all users" ON public.pending_checkouts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON public.pending_checkouts;
CREATE POLICY "Enable insert access for all users" ON public.pending_checkouts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON public.pending_checkouts;
CREATE POLICY "Enable update access for all users" ON public.pending_checkouts
  FOR UPDATE USING (true) WITH CHECK (true);
