import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        products: [],
        collections: [],
        categories: []
      });
    }

    // 1. Search products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        productid,
        name,
        description,
        isnew,
        isfeatured,
        product_images (
          imageurl
        ),
        product_variants (
          price
        )
      `)
      .neq('isdeleted', true)
      .eq('isdisabled', false)
      .ilike('name', `%${q}%`)
      .limit(10);

    if (productsError) {
      console.error('Error searching products:', productsError);
    }

    // 2. Search collections
    const { data: collections, error: collectionsError } = await supabaseAdmin
      .from('collections')
      .select('collectionid, name, slug, description, imageurl')
      .eq('isactive', true)
      .ilike('name', `%${q}%`)
      .limit(5);

    if (collectionsError) {
      console.error('Error searching collections:', collectionsError);
    }

    // 3. Search categories (product types)
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('product_types')
      .select('producttypeid, name, code, parent_producttypeid')
      .ilike('name', `%${q}%`)
      .limit(5);

    if (categoriesError) {
      console.error('Error searching categories:', categoriesError);
    }

    // For products, resolve first image and variant price
    const formattedProducts = (products || []).map((p: any) => {
      const firstImage = p.product_images?.[0]?.imageurl || null;
      const firstPrice = p.product_variants?.[0]?.price || 0;
      return {
        productid: p.productid,
        name: p.name,
        description: p.description,
        price: firstPrice,
        isnew: p.isnew,
        isfeatured: p.isfeatured,
        imageurl: firstImage
      };
    });

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      collections: collections || [],
      categories: categories || []
    });
  } catch (error) {
    console.error('Failed to execute storefront search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
