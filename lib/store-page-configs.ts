import type { StorePageConfig } from '@/components/StorePage';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=85';

export const STORE_PAGE_CONFIGS: Record<string, StorePageConfig> = {
  products: {
    title: 'Всички продукти',
    description: 'Разгледайте пълната колекция на DS-Fashion.',
    image: DEFAULT_IMAGE,
    filter: {},
  },
  'for-her': {
    title: 'Дамска колекция',
    description: 'Открийте селекция от вечна елегантност и съвременен стил.\nВисококачествени материи, прецизна изработка и женствен силует.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=85',
    filter: { rfproducttypeid: 2 },
    rfproducttypeid: 2,
  },
  'for-him': {
    title: 'Мъжка колекция',
    description: 'Открийте мъжка мода, вдъхновена от минимализма и качеството.\nОблекло, което говори с детайлите.',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&q=85',
    filter: { rfproducttypeid: 1 },
    rfproducttypeid: 1,
  },
  accessories: {
    title: 'Аксесоари',
    description: 'Перфектното допълнение към всяка визия.\nЧанти, шалове, очила и още.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=85',
    filter: { rfproducttypeid: 3 },
    rfproducttypeid: 3,
  },
  new: {
    title: 'Ново',
    description: 'Най-новите пристигания в DS-Fashion.',
    image: DEFAULT_IMAGE,
    filter: { isnew: true },
  },
  sale: {
    title: 'SALE',
    description: 'Избрани продукти на промоционални цени.',
    image: DEFAULT_IMAGE,
    filter: { onsale: true },
  },
  inspiration: {
    title: 'Вдъхновение',
    description: 'Курирана селекция за модерен стил.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=85',
    filter: { isinspiration: true },
  },
};

export function collectionPageConfig(
  name: string,
  slug: string,
  description?: string | null,
  imageurl?: string | null
): StorePageConfig {
  return {
    title: name,
    description: description || `Колекция ${name} от DS-Fashion.`,
    image: imageurl || DEFAULT_IMAGE,
    filter: { collectionslug: slug },
  };
}
