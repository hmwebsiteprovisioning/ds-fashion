/** Map rfproducttype IDs to storefront URL slugs */
export const RF_TYPE_ROUTES: Record<number, string> = {
  1: '/for-him',
  2: '/for-her',
  3: '/accessories',
};

export function rfTypePath(rfproducttypeid: number): string {
  return RF_TYPE_ROUTES[rfproducttypeid] ?? '/products';
}

/** Display order for header nav: Women (2), Men (1), Accessories (3) */
export const RF_TYPE_NAV_ORDER = [2, 1, 3];
