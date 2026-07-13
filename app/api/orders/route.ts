export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { sendCustomerOrderEmail, sendAdminOrderEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateUniqueOrderId } from '@/lib/order-id';

import { validateStock, reduceStock, createOrder, type OrderData } from '@/lib/orders';

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    // Validate stock availability before creating order
    const stockValidation = await validateStock(orderData.items);
    if (!stockValidation.valid) {
      console.error('❌ Stock validation failed:', stockValidation.insufficientStock);
      return NextResponse.json({
        success: false,
        error: 'Insufficient stock',
        insufficientStock: stockValidation.insufficientStock
      }, { status: 400 });
    }

    // Create order record
    const orderId = await createOrder(orderData);

    // Reduce stock quantities after order is successfully created
    await reduceStock(orderData.items);

    // Fetch order details with products for emails
    const supabase = supabaseAdmin;
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

    // Fetch product details for each item
    const itemsWithDetails = await Promise.all(
      (orderWithItems?.order_items || []).map(async (orderItem: any) => {
        let productInfo = {
          name: 'Unknown Product',
          brand: '',
          model: '',
          color: '',
          size: '',
          type: undefined as string | undefined,
          imageUrl: '/placeholder-image.jpg'
        };

        try {
          if (orderItem.productvariantid) {
            // Get variant details with product info
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

              // Extract property values
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
                  } else if (propName.includes('type') || propName.includes('тип')) {
                    productInfo.type = value;
                  }
                });
              }

              // Parse name to extract brand/model if properties not available
              if (!productInfo.brand && !productInfo.model) {
                const nameParts = productInfo.name.split(' ');
                productInfo.brand = nameParts[0] || '';
                productInfo.model = nameParts.slice(1).join(' ') || productInfo.name;
              }
            }
          } else if (orderItem.productid) {
            // Get product details directly
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
        } catch (error) {
          console.error('Error fetching product details for email:', error);
        }

        return {
          id: orderItem.productvariantid || orderItem.productid || '',
          name: productInfo.name,
          brand: productInfo.brand || 'Unknown',
          model: productInfo.model || productInfo.name,
          color: productInfo.color || (orderData.items.find((i: any) => i.id === orderItem.productvariantid) as any)?.color || '',
          size: productInfo.size || orderItem.size || '',
          type: productInfo.type,
          price: orderItem.price || 0,
          quantity: orderItem.quantity,
          imageUrl: productInfo.imageUrl
        };
      })
    );

    // Fetch store settings to get language
    const { data: storeSettings } = await supabase
      .from('store_settings')
      .select('language')
      .limit(1)
      .single();

    const language = (storeSettings?.language === 'bg' || storeSettings?.language === 'en') ? storeSettings.language : 'en';

    // Prepare order details for emails
    const orderDetails = {
      orderId,
      customer: orderData.customer,
      delivery: {
        ...orderData.delivery,
        street: orderData.delivery.street,
        streetNumber: orderData.delivery.streetNumber,
        entrance: orderData.delivery.entrance,
        floor: orderData.delivery.floor,
        apartment: orderData.delivery.apartment,
        econtOfficeId: orderData.delivery.econtOfficeId
      },
      items: itemsWithDetails,
      totals: orderData.totals,
      orderDate: new Date().toISOString()
    };

    // Send emails (run in parallel)
    const [customerEmailResult, adminEmailResult] = await Promise.allSettled([
      sendCustomerOrderEmail(orderDetails, language),
      sendAdminOrderEmail(orderDetails, language)
    ]);

    // Log email results
    if (customerEmailResult.status === 'rejected') {
      const errorMsg = customerEmailResult.reason?.message || String(customerEmailResult.reason);
      console.error('❌ Customer email failed:', errorMsg);
      if (errorMsg.includes('Resend:')) {
        console.error('🔧 Check RESEND_API_KEY and RESEND_FROM_EMAIL (verified domain in Resend dashboard).');
      } else if (errorMsg.includes('Gmail authentication failed') || errorMsg.includes('BadCredentials')) {
        console.error('🔧 Fix Gmail authentication or switch to Resend (RESEND_API_KEY + RESEND_FROM_EMAIL).');
      }
    }
    if (adminEmailResult.status === 'rejected') {
      const errorMsg = adminEmailResult.reason?.message || String(adminEmailResult.reason);
      console.error('❌ Admin email failed:', errorMsg);
      if (errorMsg.includes('Resend:')) {
        console.error('🔧 Check RESEND_API_KEY and RESEND_FROM_EMAIL (verified domain in Resend dashboard).');
      } else if (errorMsg.includes('Gmail authentication failed') || errorMsg.includes('BadCredentials')) {
        console.error('🔧 Fix Gmail authentication or switch to Resend (RESEND_API_KEY + RESEND_FROM_EMAIL).');
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('Order processing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
