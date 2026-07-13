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
          console.error('Error checking variant stock:', error);
          insufficientStock.push({ 
            id: item.id, 
            variantId: variantId,
            requested: item.quantity, 
            available: 0,
            reason: 'Variant not found'
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
              reason: 'Insufficient stock'
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
        reason: 'Validation error'
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
