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
  locale: 'bg' | 'en' = 'bg',
  customBaseUrl?: string
): Promise<MyposCheckoutSessionResult> {
  const config = getMyposConfig();
  if (!config) {
    throw new Error('myPOS is not configured. Missing credentials in environment variables.');
  }

  // 1. Resolve product IDs to variant IDs
  input.items = await resolveOrderItems(input.items);

  // 2. Create the pending checkout database record
  const pending = await createPendingCheckout(input);

  // Determine public base URL
  let siteUrl = customBaseUrl || process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    siteUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else if (!siteUrl && process.env.VERCEL_URL) {
    siteUrl = `https://${process.env.VERCEL_URL}`;
  }
  if (!siteUrl) {
    siteUrl = 'http://localhost:3000';
  }
  // Remove trailing slashes
  siteUrl = siteUrl.replace(/\/+$/, '');

  const urlOk = `${siteUrl}/checkout/success?session_id=${pending.id}`;
  const urlCancel = `${siteUrl}/checkout/cancel?session_id=${pending.id}`;
  const urlNotify = `${siteUrl}/api/webhooks/mypos`;

  const totalAmount = Number(input.totals.total).toFixed(2);

  // 3. Build cart items for IPC Purchase exactly matching the official SDK
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
    articles[`Currency_${itemIndex}`] = config.currency;
    itemIndex++;
  }

  // Add delivery cost as an article if greater than 0
  if (input.totals.delivery > 0) {
    articles[`Article_${itemIndex}`] = locale === 'bg' ? 'Доставка' : 'Delivery';
    articles[`Quantity_${itemIndex}`] = 1;
    articles[`Price_${itemIndex}`] = Number(input.totals.delivery).toFixed(2);
    articles[`Amount_${itemIndex}`] = Number(input.totals.delivery).toFixed(2);
    articles[`Currency_${itemIndex}`] = config.currency;
    itemIndex++;
  }

  const totalCartItems = itemIndex - 1;

  // Calculate sum of articles
  let itemsSum = 0;
  for (let i = 1; i <= totalCartItems; i++) {
    itemsSum += Number(articles[`Amount_${i}`]) || 0;
  }

  // If items sum does not equal totalAmount (e.g. due to discount coupon), collapse to clean single line item
  const finalCartParams: Record<string, string | number> = {};
  if (Math.abs(itemsSum - Number(totalAmount)) > 0.01) {
    finalCartParams.CartItems = 1;
    finalCartParams.Article_1 = locale === 'bg' ? `Поръчка № ${pending.id.substring(0, 8)}` : `Order #${pending.id.substring(0, 8)}`;
    finalCartParams.Quantity_1 = 1;
    finalCartParams.Price_1 = totalAmount;
    finalCartParams.Amount_1 = totalAmount;
    finalCartParams.Currency_1 = config.currency;
  } else {
    finalCartParams.CartItems = totalCartItems;
    Object.assign(finalCartParams, articles);
  }

  // 4. Construct IPCPurchase payload following official myPOS PHP SDK sequence
  const params: Record<string, string | number> = {
    IPCmethod: 'IPCPurchase',
    IPCVersion: '1.4',
    IPCLanguage: locale === 'bg' ? 'BG' : 'EN',
    SID: config.storeId,
    WalletNumber: config.clientNumber,
    KeyIndex: config.keyIndex,
    Currency: config.currency,
    Amount: totalAmount,
    OrderID: pending.id,
    URL_OK: urlOk,
    URL_Cancel: urlCancel,
    URL_Notify: urlNotify,

    // Customer fields (lowercase per official SDK)
    customeremail: input.customer.email?.trim() || '',
    customerphone: input.customer.telephone?.trim() || (input.customer as any).phone?.trim() || '',
    customerfirstnames: input.customer.firstName?.trim() || '',
    customerfamilyname: input.customer.lastName?.trim() || '',
    customercountry: 'BGR',
    customercity: input.customer.city?.trim() || '',
    customerzipcode: '',
    customeraddress: input.delivery.street?.trim() || input.customer.city?.trim() || '',

    // Cart Items
    ...finalCartParams,

    // Payment configuration parameters (exact casing per official SDK)
    CardTokenRequest: 0,
    PaymentParametersRequired: 2,
    PaymentMethod: 1,
  };

  console.log('🚀 [myPOS] Generated official checkout session payload:', {
    IPCmethod: params.IPCmethod,
    SID: params.SID,
    WalletNumber: params.WalletNumber,
    KeyIndex: params.KeyIndex,
    Currency: params.Currency,
    Amount: params.Amount,
    OrderID: params.OrderID,
    URL_Notify: params.URL_Notify,
    URL_OK: params.URL_OK,
    CartItems: params.CartItems,
    CardTokenRequest: params.CardTokenRequest,
    PaymentParametersRequired: params.PaymentParametersRequired,
    PaymentMethod: params.PaymentMethod,
  });

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
