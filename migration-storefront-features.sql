-- Storefront features: collections, product tags, sale pricing
-- Run in Supabase SQL editor if not applied via CLI/MCP

CREATE TABLE IF NOT EXISTS public.collections (
  collectionid uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  imageurl text,
  sortorder integer NOT NULL DEFAULT 0,
  isactive boolean NOT NULL DEFAULT true,
  createdat timestamp with time zone NOT NULL DEFAULT now(),
  updatedat timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT collections_pkey PRIMARY KEY (collectionid)
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS collectionid uuid REFERENCES public.collections(collectionid) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS isnew boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS isinspiration boolean NOT NULL DEFAULT false;

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS compare_at_price numeric CHECK (compare_at_price IS NULL OR compare_at_price >= 0);

CREATE INDEX IF NOT EXISTS idx_products_collectionid ON public.products(collectionid);
CREATE INDEX IF NOT EXISTS idx_products_isnew ON public.products(isnew) WHERE isnew = true;
CREATE INDEX IF NOT EXISTS idx_products_isinspiration ON public.products(isinspiration) WHERE isinspiration = true;

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read collections" ON public.collections;
CREATE POLICY "Public read collections" ON public.collections FOR SELECT USING (isactive = true);
