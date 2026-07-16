import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateUniqueOrderId } from '@/lib/order-id';

export interface OrderData {
  customer: {
    firstName: string;
    lastName: string;
    email?: string;
    telephone: string;
    country: string;
    city: string;
  };
  delivery: {
    type: string;
    notes: string;
    missingEcontOffice?: string;
    econtOfficeId?: string;
    street?: string;
    streetNumber?: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
  };
  items: Array<{
    id: string | number;
    quantity: number;
    size?: string;
    color?: string;
    price?: number;
  }>;
  totals: {
    subtotal: number;
    discount?: number;
    delivery: number;
    total: number;
  };
  discount?: {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  } | null;
}

// Validate stock availability
export async function validateStock(items: OrderData['items']): Promise<{ valid: boolean; insufficientStock: any[] }> {
  const supabase = supabaseAdmin;
  const insufficientStock: any[] = [];

  for (const item of items) {
    try {
      const isVariantId = item.id && typeof item.id === 'string' && item.id.length > 10;
      
      if (isVariantId) {
        const variantId = item.id;
        const { data: variant, error } = await supabase
          .from('product_variants')
          .select('quantity, trackquantity, isvisible')
          .eq('productvariantid', variantId)
          .single();

        if (error || !variant) {
          // If not found in product_variants, check if it is a valid product ID
          const { data: product } = await supabase
            .from('products')
            .select('productid')
            .eq('productid', variantId)
            .single();

          if (product) {
            // It's a product ID (no variants). Skip stock check since products table doesn't track quantity.
            console.log(`Skipping stock check for product ${item.id} (no variants in DB)`);
            continue;
          }

          console.error('Error checking variant stock:', error);
          insufficientStock.push({ 
            id: item.id, 
            variantId: variantId,
            requested: item.quantity, 
            available: 0,
            reason: 'Вариантът не е намерен'
          });
          continue;
        }

        if ((variant as any).trackquantity !== false && (variant as any).isvisible !== false) {
          const availableQuantity = (variant as any).quantity || 0;
          
          if (availableQuantity < item.quantity) {
            insufficientStock.push({
              id: item.id,
              variantId: variantId,
              requested: item.quantity,
              available: availableQuantity,
              reason: 'Недостатъчна наличност'
            });
          }
        }
      } else {
        console.log(`Skipping stock check for product ${item.id} (no variant ID)`);
      }
    } catch (error) {
      console.error('Stock validation error:', error);
      insufficientStock.push({ 
        id: item.id, 
        requested: item.quantity, 
        available: 0,
        reason: 'Грешка при валидиране'
      });
    }
  }

  return {
    valid: insufficientStock.length === 0,
    insufficientStock
  };
}

// Reduce stock quantities
export async function reduceStock(items: OrderData['items']): Promise<void> {
  const supabase = supabaseAdmin;
  for (const item of items) {
    try {
      const isVariantId = item.id && typeof item.id === 'string' && item.id.length > 10;
      
      if (isVariantId) {
        const variantId = item.id;
        const { data: variant, error: fetchError } = await supabase
          .from('product_variants')
          .select('quantity, trackquantity, productvariantid')
          .eq('productvariantid', variantId)
          .single();

        if (fetchError || !variant) {
          // If not found in product_variants, check if it is a valid product ID
          const { data: product } = await supabase
            .from('products')
            .select('productid')
            .eq('productid', variantId)
            .single();

          if (product) {
            // It's a product ID (no variants). Skip stock reduction.
            console.log(`Skipping stock reduction for product ${item.id} (no variants in DB)`);
            continue;
          }

          console.error('Error fetching variant for stock reduction:', fetchError);
          throw new Error(`Failed to fetch variant ${variantId} for stock reduction`);
        }

        const trackQuantity = variant.trackquantity !== false && variant.trackquantity !== null;
        
        if (trackQuantity) {
          const currentQuantity = Number(variant.quantity) || 0;
          const newQuantity = Math.max(0, currentQuantity - item.quantity);

          const { error: updateError } = await supabase
            .from('product_variants')
            .update({ 
              quantity: newQuantity,
              updatedat: new Date().toISOString()
            })
            .eq('productvariantid', variantId);

          if (updateError) {
            console.error('Error reducing variant stock:', updateError);
            throw new Error(`Failed to reduce stock for variant ${variantId}`);
          }
        }
      }
    } catch (error) {
      console.error('Stock reduction error:', error);
      throw error;
    }
  }
}

// Get or create customer
export async function getOrCreateCustomer(customerData: OrderData['customer']): Promise<string> {
  const supabase = supabaseAdmin;
  const email = customerData.email?.trim() || '';

  const updateExistingCustomer = async (customerId: string) => {
    await supabase
      .from('customers')
      .update({
        firstname: customerData.firstName,
        lastname: customerData.lastName,
        telephone: customerData.telephone,
        country: customerData.country,
        city: customerData.city,
        updatedat: new Date().toISOString()
      })
      .eq('customerid', customerId);
  };

  if (email) {
    const { data: existingCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('customerid')
      .eq('email', email)
      .single();

    if (existingCustomer && !fetchError) {
      await updateExistingCustomer(existingCustomer.customerid);
      return existingCustomer.customerid;
    }
  } else {
    const { data: existingByPhone, error: phoneFetchError } = await supabase
      .from('customers')
      .select('customerid')
      .eq('telephone', customerData.telephone)
      .maybeSingle();

    if (existingByPhone && !phoneFetchError) {
      await updateExistingCustomer(existingByPhone.customerid);
      return existingByPhone.customerid;
    }
  }

  const customerEmail =
    email || `guest.${Date.now()}.${Math.random().toString(36).slice(2, 9)}@checkout.local`;

  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert({
      firstname: customerData.firstName,
      lastname: customerData.lastName,
      email: customerEmail,
      telephone: customerData.telephone,
      country: customerData.country,
      city: customerData.city
    })
    .select('customerid')
    .single();

  if (createError || !newCustomer) {
    console.error('Failed to create customer:', createError);
    throw new Error('Failed to create customer');
  }

  return newCustomer.customerid;
}

// Create order record
export async function createOrder(
  orderData: OrderData,
  options?: { stripeCheckoutSessionId?: string; paymentMethod?: string }
): Promise<string> {
  const supabase = supabaseAdmin;
  const orderId = await generateUniqueOrderId(supabase);

  // Get or create customer first
  const customerId = await getOrCreateCustomer(orderData.customer);

  const baseNotes = orderData.delivery.notes?.trim();
  const missingOffice = orderData.delivery.missingEcontOffice?.trim();
  const missingOfficeNote = missingOffice ? `НОВ ОФИС ЕКОНТ: ${missingOffice}` : '';
  const deliveryNotes = [baseNotes, missingOfficeNote].filter(Boolean).join('\n');

  const orderRecord = {
    orderid: orderId,
    customerid: customerId,
    deliverytype: orderData.delivery.type,
    deliverynotes: deliveryNotes || null,
    econtoffice: orderData.delivery.econtOfficeId || null,
    deliverystreet: orderData.delivery.street || null,
    deliverystreetnumber: orderData.delivery.streetNumber || null,
    deliveryentrance: orderData.delivery.entrance || null,
    deliveryfloor: orderData.delivery.floor || null,
    deliveryapartment: orderData.delivery.apartment || null,
    subtotal: orderData.totals.subtotal,
    deliverycost: orderData.totals.delivery,
    total: orderData.totals.total,
    discountcode: orderData.discount?.code || null,
    discounttype: orderData.discount?.type || null,
    discountvalue: orderData.discount?.value || null,
    discountamount: orderData.discount?.amount || 0,
    status: 'pending',
    paymentmethod: options?.paymentMethod || 'cod',
    stripe_checkout_session_id: options?.stripeCheckoutSessionId || null,
    createdat: new Date().toISOString(),
    updatedat: new Date().toISOString()
  };

  const { error } = await supabase
    .from('orders')
    .insert(orderRecord);

  if (error) {
    console.error('❌ Database Order Insertion Error:', error.message);
    throw new Error(`Failed to create order record: ${error.message}`);
  }

  // Create order items
  const orderItemsPromises = orderData.items.map(async (item) => {
    let productId = null;
    let productVariantId = null;
    let price = 0;

    if (item.id && typeof item.id === 'string' && item.id.length > 10) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('productid, price')
        .eq('productvariantid', item.id)
        .single();

      if (variant) {
        productId = variant.productid;
        productVariantId = item.id;
        price = variant.price || 0;
      }
    } else if (item.id) {
      productId = item.id;
      price = item.price || 0;
    }

    return {
      orderid: orderId,
      productid: productId,
      productvariantid: productVariantId,
      quantity: item.quantity,
      price: price,
      createdat: new Date().toISOString()
    };
  });

  const orderItems = await Promise.all(orderItemsPromises);

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw new Error('Failed to create order items');
  }

  return orderId;
}

async function resolveVariantId(
  productId: string, 
  size?: string, 
  color?: string
): Promise<{ productVariantId: string; price: number | null } | null> {
  const supabase = supabaseAdmin;
  
  const { data: variants, error } = await supabase
    .from('product_variants')
    .select(`
      productvariantid,
      price,
      product_variant_property_values (
        value,
        propertyid
      )
    `)
    .eq('productid', productId);

  if (error || !variants || variants.length === 0) {
    return null;
  }

  const targetSize = size?.trim().toLowerCase();
  const targetColor = color?.trim().toLowerCase();

  // Size & Color property IDs from DB
  const sizePropertyId = '0616f167-014d-492d-8865-6d6b0bae308a';
  const colorPropertyId = '67674148-33dd-4609-9074-6701b75438e0';

  // 1. Try to match both size and color
  for (const variant of variants) {
    const propValues = (variant.product_variant_property_values as any[]) || [];
    let matchesSize = !targetSize;
    let matchesColor = !targetColor;

    for (const pv of propValues) {
      if (pv.propertyid === sizePropertyId && targetSize) {
        if (pv.value?.trim().toLowerCase() === targetSize) {
          matchesSize = true;
        }
      }
      if (pv.propertyid === colorPropertyId && targetColor) {
        if (pv.value?.trim().toLowerCase() === targetColor) {
          matchesColor = true;
        }
      }
    }

    if (matchesSize && matchesColor) {
      return {
        productVariantId: variant.productvariantid,
        price: variant.price
      };
    }
  }

  // 2. Fallback: match size only
  if (targetSize) {
    for (const variant of variants) {
      const propValues = (variant.product_variant_property_values as any[]) || [];
      let matchesSize = false;

      for (const pv of propValues) {
        if (pv.propertyid === sizePropertyId) {
          if (pv.value?.trim().toLowerCase() === targetSize) {
            matchesSize = true;
          }
        }
      }

      if (matchesSize) {
        return {
          productVariantId: variant.productvariantid,
          price: variant.price
        };
      }
    }
  }

  // 3. Fallback: just return the first variant if nothing matched
  return {
    productVariantId: variants[0].productvariantid,
    price: variants[0].price
  };
}

export async function resolveOrderItems(items: OrderData['items']): Promise<OrderData['items']> {
  const resolvedItems = [];
  for (const item of items) {
    const resolvedItem = { ...item };
    const idStr = String(item.id);
    
    // Check if it's a variant ID
    const { data: variant } = await supabaseAdmin
      .from('product_variants')
      .select('productvariantid')
      .eq('productvariantid', idStr)
      .single();

    if (variant) {
      resolvedItem.id = variant.productvariantid;
    } else {
      // Check if it's a product ID
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('productid')
        .eq('productid', idStr)
        .single();

      if (product) {
        const resolved = await resolveVariantId(product.productid, item.size, item.color);
        if (resolved) {
          resolvedItem.id = resolved.productVariantId;
          if (resolved.price) {
            resolvedItem.price = resolved.price;
          }
        }
      }
    }
    resolvedItems.push(resolvedItem);
  }
  return resolvedItems;
}
