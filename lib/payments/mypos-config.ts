import crypto from 'crypto';

export interface MyposConfig {
  environment: 'production' | 'sandbox';
  clientNumber: string;
  storeId: string;
  keyIndex: number;
  currency: string;
  privateKey: string;
  publicCertificate: string;
}

export function normalizePem(pem?: string, type: 'PRIVATE' | 'CERTIFICATE' = 'PRIVATE'): string | undefined {
  if (!pem) return undefined;
  let str = pem.trim();
  if (!str) return undefined;

  // Remove surrounding single or double quotes if present (common in .env files)
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.substring(1, str.length - 1);
  }

  // Replace literal '\n' and remove carriage returns
  str = str.replace(/\\n/g, '\n').replace(/\r/g, '');

  const headerMatch = str.match(/-----BEGIN ([A-Z ]+)-----/);
  const footerMatch = str.match(/-----END ([A-Z ]+)-----/);

  if (headerMatch && footerMatch) {
    const headerType = headerMatch[1];
    const header = `-----BEGIN ${headerType}-----`;
    const footer = `-----END ${headerType}-----`;

    const bodyStart = str.indexOf(header) + header.length;
    const bodyEnd = str.indexOf(footer);
    if (bodyEnd > bodyStart) {
      const rawBody = str.substring(bodyStart, bodyEnd).replace(/\s+/g, '');
      const chunked = rawBody.match(/.{1,64}/g)?.join('\n') || rawBody;
      const candidate = `${header}\n${chunked}\n${footer}\n`;

      if (type === 'PRIVATE') {
        try {
          crypto.createPrivateKey(candidate);
          return candidate;
        } catch {
          // If header was RSA PRIVATE KEY, try PRIVATE KEY (PKCS#8) or vice-versa
          const altType = headerType.includes('RSA') ? 'PRIVATE KEY' : 'RSA PRIVATE KEY';
          const altCandidate = `-----BEGIN ${altType}-----\n${chunked}\n-----END ${altType}-----\n`;
          try {
            crypto.createPrivateKey(altCandidate);
            return altCandidate;
          } catch {
            return candidate;
          }
        }
      }
      return candidate;
    }
  }

  // If no headers provided (raw base64), try both PKCS#1 and PKCS#8
  const cleanBase64 = str.replace(/\s+/g, '');
  const chunked = cleanBase64.match(/.{1,64}/g)?.join('\n') || cleanBase64;

  if (type === 'PRIVATE') {
    const formats = ['RSA PRIVATE KEY', 'PRIVATE KEY'];
    for (const fmt of formats) {
      const cand = `-----BEGIN ${fmt}-----\n${chunked}\n-----END ${fmt}-----\n`;
      try {
        crypto.createPrivateKey(cand);
        return cand;
      } catch {
        // try next format
      }
    }
    return `-----BEGIN RSA PRIVATE KEY-----\n${chunked}\n-----END RSA PRIVATE KEY-----\n`;
  }

  return `-----BEGIN CERTIFICATE-----\n${chunked}\n-----END CERTIFICATE-----\n`;
}

export function getMyposConfig(): MyposConfig | null {
  const clientNumber = process.env.MYPOS_CLIENT_NUMBER?.trim();
  const storeId = process.env.MYPOS_STORE_ID?.trim();
  const privateKey = normalizePem(process.env.MYPOS_PRIVATE_KEY, 'PRIVATE');
  const publicCertificate = normalizePem(process.env.MYPOS_PUBLIC_CERTIFICATE, 'CERTIFICATE');

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
