export const STORE_NAME = 'DS-Fashion';
export const STORE_NAME_DISPLAY = 'DS-Fashion';
export const DEFAULT_LOGO_PATH = '/logo-no-bg.png';

export function getLogoUrl(logourl: string | null | undefined): string {
  return logourl?.trim() || DEFAULT_LOGO_PATH;
}
