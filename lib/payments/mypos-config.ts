export interface MyposConfig {
  environment: 'production' | 'sandbox';
  clientNumber: string;
  storeId: string;
  keyIndex: number;
  currency: string;
  privateKey: string;
  publicCertificate: string;
}

function normalizePem(pem?: string): string | undefined {
  if (!pem) return undefined;
  const trimmed = pem.trim();
  if (!trimmed) return undefined;
  // If PEM was provided with literal escaped \n, replace with actual newlines
  if (trimmed.includes('\\n')) {
    return trimmed.replace(/\\n/g, '\n');
  }
  return trimmed;
}

export function getMyposConfig(): MyposConfig | null {
  const clientNumber = process.env.MYPOS_CLIENT_NUMBER?.trim();
  const storeId = process.env.MYPOS_STORE_ID?.trim();
  const privateKey = normalizePem(process.env.MYPOS_PRIVATE_KEY);
  const publicCertificate = normalizePem(process.env.MYPOS_PUBLIC_CERTIFICATE);

  if (!clientNumber || !storeId || !privateKey) {
    return null;
  }

  const envRaw = (process.env.MYPOS_ENVIRONMENT || 'production').toLowerCase().trim();
  const environment: 'production' | 'sandbox' = envRaw === 'sandbox' || envRaw === 'test' ? 'sandbox' : 'production';
  const keyIndex = parseInt(process.env.MYPOS_KEY_INDEX?.trim() || '1', 10) || 1;
  const currency = (process.env.MYPOS_CURRENCY?.trim() || 'EUR').toUpperCase();

  return {
    environment,
    clientNumber,
    storeId,
    keyIndex,
    currency,
    privateKey,
    publicCertificate: publicCertificate || '',
  };
}

export function isMyposConfigured(): boolean {
  return getMyposConfig() !== null;
}
