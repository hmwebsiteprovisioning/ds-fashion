import { toColorSwatch, type ColorSwatch } from './color-swatches';

export type StorefrontProduct = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  isOnSale: boolean;
  isNew: boolean;
  isInspiration: boolean;
  rfproducttypeid?: number;
  collectionid?: string | null;
  images: string[];
  colors: ColorSwatch[];
  sizes: string[];
  producttypeid?: string;
  productTypeName?: string;
  createdat?: string;
  hero_portrait_imageurl?: string | null;
  hero_landscape_imageurl?: string | null;
  rawVariants?: any[];
  allOptions?: Record<string, { originalName: string; values: string[] }>;
  colorImages?: Record<string, string[]>;
};

const COLOR_KEYS = ['color', 'colour', 'цвят', 'Color', 'Colour', 'Цвят'];
const SIZE_KEYS = ['size', 'размер', 'Size', 'Размер'];

function getPropertyValue(props: Record<string, string>, keys: string[]): string {
  const normalizedKeys = keys.map((k) => k.trim().toLowerCase());
  for (const [k, v] of Object.entries(props)) {
    if (normalizedKeys.includes(k.trim().toLowerCase())) return v;
  }
  return '';
}

function variantProperties(variant: any): Record<string, string> {
  const acc: Record<string, string> = {};
  const propertyValues =
    variant?.ProductVariantPropertyvalues ||
    variant?.ProductVariantPropertyValues ||
    variant?.product_variant_property_values ||
    variant?.productVariantPropertyvalues ||
    [];
  propertyValues.forEach((pv: any) => {
    const propName =
      pv.Property?.name ||
      pv.Property?.Name ||
      pv.properties?.name ||
      pv.properties?.Name ||
      pv.propertyid ||
      '';
    const propValue = pv.value || pv.Value || '';
    if (propName && propValue) {
      acc[propName.trim()] = propValue;
    }
  });
  return acc;
}

export function toStorefrontProduct(apiProduct: any): StorefrontProduct {
  const variants = apiProduct.variants || apiProduct.Variants || [];
  const colorSet = new Map<string, ColorSwatch>();
  const sizeSet = new Set<string>();
  const optionsMap: Record<string, { originalName: string; values: Set<string> }> = {};
  const colorImagesMap: Record<string, string[]> = {};
  let minPrice = Infinity;
  let maxCompareAt = 0;
  let isOnSale = false;

  const rawImageObjects: any[] = Array.isArray(apiProduct.Images)
    ? apiProduct.Images
    : Array.isArray(apiProduct.images)
    ? apiProduct.images
    : [];

  const variantImagesFromDb: Record<string, string[]> = {};
  rawImageObjects.forEach((img: any) => {
    if (typeof img === 'object' && img !== null) {
      const varId = img.productvariantid || img.productVariantId || img.ProductVariantID;
      const url = img.imageurl || img.imageUrl;
      if (varId && url) {
        if (!variantImagesFromDb[varId]) variantImagesFromDb[varId] = [];
        if (!variantImagesFromDb[varId].includes(url)) {
          variantImagesFromDb[varId].push(url);
        }
      }
    }
  });

  variants.forEach((variant: any) => {
    const props = variantProperties(variant);

    Object.entries(props).forEach(([name, value]) => {
      const trimmedName = name.trim();
      const key = trimmedName.toLowerCase();
      if (!optionsMap[key]) {
        optionsMap[key] = { originalName: trimmedName, values: new Set() };
      }
      optionsMap[key].values.add(value);
    });

    const colorVal = getPropertyValue(props, COLOR_KEYS);
    const sizeVal = getPropertyValue(props, SIZE_KEYS);
    if (colorVal) {
      const swatch = toColorSwatch(colorVal);
      colorSet.set(swatch.name.toLowerCase(), swatch);

      const varId = variant.productvariantid || variant.ProductVariantID;
      const directImgs: string[] = Array.isArray(variant.images) && variant.images.length > 0
        ? variant.images
        : variant.imageurl
        ? [variant.imageurl]
        : (varId && variantImagesFromDb[varId])
        ? variantImagesFromDb[varId]
        : [];

      if (directImgs.length > 0) {
        const colorKey = colorVal.trim().toLowerCase();
        if (!colorImagesMap[colorKey]) {
          colorImagesMap[colorKey] = [...directImgs];
        } else {
          directImgs.forEach((img) => {
            if (!colorImagesMap[colorKey].includes(img)) {
              colorImagesMap[colorKey].push(img);
            }
          });
        }
      }
    }
    if (sizeVal) sizeSet.add(sizeVal);

    const price = Number(variant.price) || 0;
    const compareAt = variant.compare_at_price != null ? Number(variant.compare_at_price) : null;
    if (price > 0 && price < minPrice) minPrice = price;
    if (compareAt != null && compareAt > price) {
      isOnSale = true;
      if (compareAt > maxCompareAt) maxCompareAt = compareAt;
    }
  });

  if (minPrice === Infinity) minPrice = Number(apiProduct.price) || 0;

  const images: string[] = Array.isArray(apiProduct.images) && apiProduct.images.length > 0
    ? apiProduct.images.map((img: any) => typeof img === 'string' ? img : img.imageurl).filter(Boolean)
    : (apiProduct.Images && apiProduct.Images.length > 0)
    ? apiProduct.Images.map((img: any) => typeof img === 'string' ? img : img.imageurl).filter(Boolean)
    : ['/hero-home.png'];

  const allOptions: Record<string, { originalName: string; values: string[] }> = {};
  Object.entries(optionsMap).forEach(([key, item]) => {
    allOptions[key] = {
      originalName: item.originalName,
      values: Array.from(item.values),
    };
  });

  return {
    id: apiProduct.id || apiProduct.productid,
    name: apiProduct.name || `${apiProduct.brand ?? ''} ${apiProduct.model ?? ''}`.trim(),
    price: minPrice,
    compareAtPrice: isOnSale ? maxCompareAt : undefined,
    isOnSale,
    isNew: !!(apiProduct.isnew ?? apiProduct.isNew),
    isInspiration: !!(apiProduct.isinspiration ?? apiProduct.isInspiration),
    rfproducttypeid: apiProduct.rfproducttypeid,
    collectionid: apiProduct.collectionid,
    images,
    colors: Array.from(colorSet.values()),
    sizes: Array.from(sizeSet),
    producttypeid: apiProduct.producttypeid || apiProduct.productTypeID,
    productTypeName: apiProduct.type || apiProduct.product_types?.name,
    createdat: apiProduct.createdat,
    hero_portrait_imageurl: apiProduct.hero_portrait_imageurl,
    hero_landscape_imageurl: apiProduct.hero_landscape_imageurl,
    rawVariants: variants,
    allOptions,
    colorImages: colorImagesMap,
  };
}

export function buildStorefrontProducts(apiProducts: any[]): StorefrontProduct[] {
  return (apiProducts || []).map(toStorefrontProduct);
}

export type StorefrontFilterParams = {
  rfproducttypeid?: number;
  producttypeid?: string;
  isnew?: boolean;
  isinspiration?: boolean;
  onsale?: boolean;
  collectionid?: string;
  collectionslug?: string;
  isfeatured?: boolean;
  limit?: number;
};

export function buildProductsQuery(params: StorefrontFilterParams): string {
  const q = new URLSearchParams();
  if (params.rfproducttypeid != null) q.set('rfproducttypeid', String(params.rfproducttypeid));
  if (params.producttypeid) q.set('producttypeid', params.producttypeid);
  if (params.isnew) q.set('isnew', 'true');
  if (params.isinspiration) q.set('isinspiration', 'true');
  if (params.onsale) q.set('onsale', 'true');
  if (params.collectionid) q.set('collectionid', params.collectionid);
  if (params.collectionslug) q.set('collectionslug', params.collectionslug);
  if (params.isfeatured) q.set('isfeatured', 'true');
  if (params.limit) q.set('limit', String(params.limit));
  return q.toString();
}

export async function fetchStorefrontProducts(params: StorefrontFilterParams): Promise<StorefrontProduct[]> {
  const query = buildProductsQuery(params);
  const res = await fetch(`/api/products${query ? `?${query}` : ''}`);
  const data = await res.json();
  if (!data.success) return [];
  return buildStorefrontProducts(data.products);
}
