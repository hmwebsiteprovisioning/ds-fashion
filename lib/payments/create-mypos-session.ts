import { getMyposConfig } from './mypos-config';
import { getMyposCheckoutUrl, signMyposData } from './mypos-client';
import { createPendingCheckout } from './pending-checkout';
import { resolveOrderItems, type OrderData } from '@/lib/orders';

export interface MyposCheckoutSessionResult {
  sessionId: string;
  formUrl: string;
  formData: Record<string, string | number>;
}

export async function createMyposCheckoutSession(
  input: OrderData,
  locale: 'bg' | 'en' = 'bg'
): Promise<MyposCheckoutSessionResult> {
  const config = getMyposConfig();
  if (!config) {
    throw new Error('myPOS is not configured. Missing credentials in environment variables.');
  }

  // 1. Resolve product IDs to variant IDs
  input.items = await resolveOrderItems(input.items);

  // 2. Create the pending checkout database record
  const pending = await createPendingCheckout(input);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const urlOk = `${siteUrl}/checkout/success?session_id=${pending.id}`;
  const urlCancel = `${siteUrl}/checkout?payment=cancelled`;
  const urlNotify = `${siteUrl}/api/webhooks/mypos`;

  // 3. Build cart items for IPC Purchase
  const articles: Record<string, string | number> = {};
  let itemIndex = 1;

  for (const item of input.items) {
    const itemName = (item as any).name || (locale === 'bg' ? `Артикул ${itemIndex}` : `Item ${itemIndex}`);
    const itemPrice = Number(item.price || 0);
    const itemQty = Number(item.quantity || 1);
    const itemTotal = (itemPrice * itemQty).toFixed(2);

    articles[`Article_${itemIndex}`] = itemName.substring(0, 100);
    articles[`Quantity_${itemIndex}`] = itemQty;
    articles[`Price_${itemIndex}`] = itemPrice.toFixed(2);
    articles[`Amount_${itemIndex}`] = itemTotal;
    itemIndex++;
  }

  // Add delivery cost as an article if greater than 0
  if (input.totals.delivery > 0) {
    articles[`Article_${itemIndex}`] = locale === 'bg' ? 'Доставка' : 'Delivery';
    articles[`Quantity_${itemIndex}`] = 1;
    articles[`Price_${itemIndex}`] = Number(input.totals.delivery).toFixed(2);
    articles[`Amount_${itemIndex}`] = Number(input.totals.delivery).toFixed(2);
    itemIndex++;
  }

  // Add discount as a line item if greater than 0
  if (input.discount && input.discount.amount > 0) {
    articles[`Article_${itemIndex}`] = locale === 'bg' 
      ? `Отстъпка (${input.discount.code || ''})` 
      : `Discount (${input.discount.code || ''})`;
    articles[`Quantity_${itemIndex}`] = 1;
    articles[`Price_${itemIndex}`] = (-Math.abs(Number(input.discount.amount))).toFixed(2);
    articles[`Amount_${itemIndex}`] = (-Math.abs(Number(input.discount.amount))).toFixed(2);
    itemIndex++;
  }

  const totalCartItems = itemIndex - 1;

  // 4. Construct IPCPurchase payload (Order of fields is maintained for standard compliance)
  const params: Record<string, string | number> = {
    IPCmethod: 'IPCPurchase',
    IPCVersion: '1.4',
    IPCLanguage: locale === 'bg' ? 'BG' : 'EN',
    SID: config.storeId,
    WalletNumber: config.clientNumber,
    KeyIndex: config.keyIndex,
    Currency: config.currency,
    Amount: Number(input.totals.total).toFixed(2),
    OrderID: pending.id,
    URL_OK: urlOk,
    URL_Cancel: urlCancel,
    URL_Notify: urlNotify,
    Card_Token_Request: 0,
    Payment_Parameters_Required: 1,
    Customer_Email: input.customer.email?.trim() || '',
    Customer_First_Name: input.customer.firstName?.trim() || '',
    Customer_Last_Name: input.customer.lastName?.trim() || '',
    Customer_Phone: input.customer.telephone?.trim() || (input.customer as any).phone?.trim() || '',
    Customer_Country: 'BGR',
    Customer_City: input.customer.city?.trim() || '',
    Customer_Address: input.delivery.street?.trim() || input.customer.city?.trim() || '',
    CartItems: totalCartItems,
    ...articles,
  };

  // 5. Sign the payload using RSA Private Key
  const signature = signMyposData(params, config.privateKey);
  params.Signature = signature;

  const formUrl = getMyposCheckoutUrl(config.environment);

  return {
    sessionId: pending.id,
    formUrl,
    formData: params,
  };
}
