import {
  getOrderBySessionId,
  getPendingCheckoutById,
  getPendingCheckoutBySessionId,
  markPendingCheckoutCompleted,
} from './pending-checkout';
import { validateStock, reduceStock, createOrder, resolveOrderItems } from '@/lib/orders';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendCustomerOrderEmail, sendAdminOrderEmail } from '@/lib/email';

export interface FulfilledCheckout {
  orderId: string;
  orderNumber: string;
  alreadyExisted: boolean;
}

export async function fulfillMyposCheckout(
  sessionId: string,
  transactionRef?: string
): Promise<FulfilledCheckout | null> {
  const supabase = supabaseAdmin;

  // 1. Guard: Check if an order already exists for this session / order ID
  const existing = await getOrderBySessionId(sessionId);
  if (existing) {
    return {
      orderId: existing.orderId,
      orderNumber: existing.orderNumber,
      alreadyExisted: true,
    };
  }

  // 2. Resolve pending checkout record
  const pending = (await getPendingCheckoutById(sessionId)) || (await getPendingCheckoutBySessionId(sessionId));

  if (!pending) {
    console.error(`❌ [myPOS] Could not resolve pending checkout payload for session: ${sessionId}`);
    return null;
  }

  // 3. Guard: If checkout was already completed
  if (pending.status === 'completed' && pending.orderId) {
    return {
      orderId: pending.orderId,
      orderNumber: pending.orderId,
      alreadyExisted: true,
    };
  }

  // 4. Resolve product IDs to variant IDs
  pending.payload.items = await resolveOrderItems(pending.payload.items);

  // 5. Validate stock availability before order insertion
  const stockValidation = await validateStock(pending.payload.items);
  if (!stockValidation.valid) {
    console.error('❌ [myPOS] Stock validation warning during fulfillment:', stockValidation.insufficientStock);
  }

  // 6. Create real order record in DB
  const orderId = await createOrder(pending.payload, {
    stripeCheckoutSessionId: sessionId, // Used for idempotent session lookup
    paymentMethod: 'card_online',
  });

  // 7. Reduce stock quantities
  try {
    await reduceStock(pending.payload.items);
  } catch (stockErr) {
    console.error('❌ [myPOS] Error reducing stock during fulfillment:', stockErr);
  }

  // 8. Mark pending checkout completed
  await markPendingCheckoutCompleted(pending.id, orderId);

  // 9. Fetch detailed product info and dispatch confirmation emails
  try {
    const { data: orderWithItems } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          orderitemid,
          quantity,
          price,
          productid,
          productvariantid
        )
      `)
      .eq('orderid', orderId)
      .single();

    const itemsWithDetails = await Promise.all(
      (orderWithItems?.order_items || []).map(async (orderItem: any) => {
        let productInfo = {
          name: 'Unknown Product',
          brand: '',
          model: '',
          color: '',
          size: '',
          type: undefined as string | undefined,
          imageUrl: '/placeholder-image.jpg',
        };

        try {
          if (orderItem.productvariantid) {
            const { data: variant } = await supabase
              .from('product_variants')
              .select(`
                sku,
                productid,
                price,
                products!inner (
                  name
                ),
                product_variant_property_values (
                  value,
                  properties!inner (
                    name
                  )
                )
              `)
              .eq('productvariantid', orderItem.productvariantid)
              .single();

            if (variant) {
              const productData = variant.products;
              productInfo.name = Array.isArray(productData)
                ? productData[0]?.name || variant.sku || 'Unknown Product'
                : (productData as any)?.name || variant.sku || 'Unknown Product';

              if (variant.product_variant_property_values && Array.isArray(variant.product_variant_property_values)) {
                variant.product_variant_property_values.forEach((pvv: any) => {
                  const propName = pvv.properties?.name?.toLowerCase() || '';
                  const value = pvv.value || '';
                  if (propName.includes('color') || propName.includes('colour') || propName.includes('цвят')) {
                    productInfo.color = value;
                  } else if (propName.includes('size') || propName.includes('размер')) {
                    productInfo.size = value;
                  } else if (propName.includes('brand') || propName.includes('марка')) {
                    productInfo.brand = value;
                  } else if (propName.includes('model') || propName.includes('модел')) {
                    productInfo.model = value;
                  }
                });
              }

              if (!productInfo.brand && !productInfo.model) {
                const nameParts = productInfo.name.split(' ');
                productInfo.brand = nameParts[0] || '';
                productInfo.model = nameParts.slice(1).join(' ') || productInfo.name;
              }
            }
          } else if (orderItem.productid) {
            const { data: product } = await supabase
              .from('products')
              .select('name')
              .eq('productid', orderItem.productid)
              .single();

            if (product) {
              productInfo.name = product.name || 'Unknown Product';
              const nameParts = productInfo.name.split(' ');
              productInfo.brand = nameParts[0] || '';
              productInfo.model = nameParts.slice(1).join(' ') || productInfo.name;
            }
          }
        } catch (err) {
          console.error('Error fetching product details for myPOS confirmation email:', err);
        }

        return {
          id: orderItem.productvariantid || orderItem.productid || '',
          name: productInfo.name,
          brand: productInfo.brand || 'Unknown',
          model: productInfo.model || productInfo.name,
          color: productInfo.color || '',
          size: productInfo.size || '',
          type: productInfo.type,
          price: orderItem.price || 0,
          quantity: orderItem.quantity,
          imageUrl: productInfo.imageUrl,
        };
      })
    );

    const { data: storeSettings } = await supabase
      .from('store_settings')
      .select('language')
      .limit(1)
      .single();

    const language = (storeSettings?.language === 'bg' || storeSettings?.language === 'en') ? storeSettings.language : 'bg';

    const orderDetails = {
      orderId,
      customer: pending.payload.customer,
      delivery: pending.payload.delivery,
      items: itemsWithDetails,
      totals: pending.payload.totals,
      orderDate: new Date().toISOString(),
    };

    console.log(`✉️ [myPOS] Dispatched order fulfillment emails for order: ${orderId}${transactionRef ? ` (Ref: ${transactionRef})` : ''}`);
    await Promise.allSettled([
      sendCustomerOrderEmail(orderDetails, language),
      sendAdminOrderEmail(orderDetails, language),
    ]);
  } catch (emailErr) {
    console.error('❌ [myPOS] Failed to dispatch confirmation emails:', emailErr);
  }

  return { orderId, orderNumber: orderId, alreadyExisted: false };
}
