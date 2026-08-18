import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase';
import { STORE_NAME } from '@/lib/branding';
import ProductPageClient from './ProductPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ds-fashion.eu').replace(/\/$/, '');

  try {
    const supabase = createServerClient();
    const { data: product } = await supabase
      .from('products')
      .select(`
        productid,
        brand,
        model,
        name,
        description,
        price,
        images:product_images(imageurl, isprimary),
        variants:product_variants(imageurl, price)
      `)
      .eq('productid', id)
      .eq('isdeleted', false)
      .single();

    if (!product) {
      return {
        title: `Продукт | ${STORE_NAME}`,
        description: `Открийте най-новите модни предложения в ${STORE_NAME}.`,
      };
    }

    const brand = product.brand?.trim() || '';
    const model = product.model?.trim() || product.name?.trim() || 'Продукт';
    const fullName = brand ? `${brand} ${model}` : model;
    const title = `${fullName} | ${STORE_NAME}`;

    const description = product.description?.trim()
      ? product.description.trim().slice(0, 200)
      : `${fullName} – поръчайте онлайн от ${STORE_NAME} с бърза доставка, преглед и тест преди плащане.`;

    // Find best product image for crawler preview (Facebook, Viber, Messenger, WhatsApp, Twitter)
    let rawImageUrl = '';
    const primaryImg = product.images?.find((img: any) => img.isprimary)?.imageurl;
    const firstImg = product.images?.[0]?.imageurl;
    const variantImg = product.variants?.find((v: any) => v.imageurl)?.imageurl;

    rawImageUrl = primaryImg || firstImg || variantImg || '/logo-no-bg.png';

    const absoluteImageUrl = rawImageUrl.startsWith('http')
      ? rawImageUrl
      : `${siteUrl}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;

    const productUrl = `${siteUrl}/products/${id}`;
    const priceStr = product.price != null ? Number(product.price).toFixed(2) : undefined;

    return {
      title,
      description,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title,
        description,
        url: productUrl,
        siteName: STORE_NAME,
        locale: 'bg_BG',
        type: 'website',
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: fullName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absoluteImageUrl],
      },
      other: {
        'og:image:secure_url': absoluteImageUrl,
        ...(priceStr ? { 'product:price:amount': priceStr, 'product:price:currency': 'BGN' } : {}),
      },
    };
  } catch (err) {
    console.error('Error generating metadata for product:', id, err);
    return {
      title: `Продукт | ${STORE_NAME}`,
      description: `Открийте най-новите предложения в ${STORE_NAME}.`,
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductPageClient id={id} />;
}
