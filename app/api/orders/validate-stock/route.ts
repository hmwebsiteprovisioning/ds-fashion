import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface StockValidationItem {
  id: string | number;
  quantity: number;
  size?: string;
  color?: string;
}

interface StockResult {
  id: string | number;
  requested: number;
  available: number;
  variantId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { items }: { items: StockValidationItem[] } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, results: [], insufficientStock: [] });
    }

    const supabase = supabaseAdmin;
    const results: StockResult[] = [];
    const insufficientStock: StockResult[] = [];

    for (const item of items) {
      try {
        const targetId = String(item.id || '');
        if (!targetId) continue;

        // 1. Try to find by productvariantid first
        let { data: variant } = await supabase
          .from('product_variants')
          .select(`
            productvariantid,
            quantity,
            trackquantity,
            isvisible,
            productid,
            product_variant_property_values (
              value,
              properties:propertyid (
                name
              )
            )
          `)
          .eq('productvariantid', targetId)
          .maybeSingle();

        // 2. If not found by variantid, search by productid + color + size
        if (!variant) {
          const { data: productVariants } = await supabase
            .from('product_variants')
            .select(`
              productvariantid,
              quantity,
              trackquantity,
              isvisible,
              productid,
              product_variant_property_values (
                value,
                properties:propertyid (
                  name
                )
              )
            `)
            .eq('productid', targetId);

          if (productVariants && productVariants.length > 0) {
            // Try to find a variant matching color + size
            const match = productVariants.find((v: any) => {
              if (v.isvisible === false) return false;
              const pvs = v.product_variant_property_values || [];
              let colorMatch = !item.color; // true if no color to match
              let sizeMatch = !item.size;   // true if no size to match

              pvs.forEach((pv: any) => {
                const propName = String(pv.properties?.name || '').trim().toLowerCase();
                const propValue = String(pv.value || '').trim().toLowerCase();

                if (['color', 'colour', 'цвят'].includes(propName) && item.color) {
                  colorMatch = propValue === item.color.trim().toLowerCase();
                }
                if (['size', 'размер'].includes(propName) && item.size) {
                  sizeMatch = propValue === item.size.trim().toLowerCase();
                }
              });

              return colorMatch && sizeMatch;
            });

            variant = match || productVariants[0];
          }
        }

        if (variant) {
          const tracksQty = variant.trackquantity !== false && variant.trackquantity !== null;
          const available = tracksQty ? Math.max(0, Number(variant.quantity) || 0) : -1; // -1 means untracked

          const result: StockResult = {
            id: item.id,
            requested: item.quantity,
            available,
            variantId: variant.productvariantid,
          };

          results.push(result);

          if (tracksQty && available < item.quantity) {
            insufficientStock.push(result);
          }
        } else {
          // Variant not found — treat as 0 stock
          const result: StockResult = {
            id: item.id,
            requested: item.quantity,
            available: 0,
          };
          results.push(result);
          insufficientStock.push(result);
        }
      } catch (error) {
        console.error('Stock validation error for item:', item.id, error);
        const result: StockResult = {
          id: item.id,
          requested: item.quantity,
          available: 0,
        };
        results.push(result);
        insufficientStock.push(result);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      insufficientStock,
    });
  } catch (error) {
    console.error('Stock validation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate stock' },
      { status: 500 }
    );
  }
}
