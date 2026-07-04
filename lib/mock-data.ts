export type MockProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number; // BGN
  category: 'women' | 'men' | 'accessories';
  subcategory: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  isNew?: boolean;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  material?: string;
  fit?: string;
  care?: string;
  season?: string;
  modelInfo?: string;
  sku?: string;
};

export const MOCK_PRODUCTS: MockProduct[] = [
  // WOMEN
  {
    id: 'w1', slug: 'sako-milano', name: 'Сако Milano', brand: 'DS-Fashion',
    price: 229.90, category: 'women', subcategory: 'Сака',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=85',
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=85',
    ],
    colors: [{ name: 'Бежово', hex: '#c8b49a' }, { name: 'Черно', hex: '#1a1a1a' }, { name: 'Сиво', hex: '#9e9e9e' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Класическо двуредно сако с прецизна кройка и висококачествена подплата. Перфектен избор за деловата жена.',
    isNew: true, inStock: true, rating: 4.8, reviewCount: 24,
    material: '70% вълна, 30% полиестер', fit: 'Slim fit', care: 'Химическо чистене', season: 'Пролет / Есен', modelInfo: '176 см, носи размер S', sku: 'LX-W-JAK-001-BEI',
  },
  {
    id: 'w2', slug: 'kopriena-riza', name: 'Коприена риза', brand: 'DS-Fashion',
    price: 179.90, category: 'women', subcategory: 'Блузи и ризи',
    images: [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=85',
      'https://images.unsplash.com/photo-1566206091558-7f218b696731?w=800&q=85',
    ],
    colors: [{ name: 'Слонова кост', hex: '#fffff0' }, { name: 'Черно', hex: '#1a1a1a' }, { name: 'Пудра', hex: '#f4c2c2' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: '100% естествена коприна с мек, луксозен усет. Леката тъкан пада перфектно по тялото.',
    inStock: true, rating: 4.9, reviewCount: 18,
    material: '100% коприна', fit: 'Regular fit', care: 'Ръчно пране 30°C', season: 'Целогодишно', modelInfo: '175 см, носи размер S', sku: 'LX-W-BLU-002-IVO',
  },
  {
    id: 'w3', slug: 'roklia-elegance', name: 'Рокля Elegance', brand: 'DS-Fashion',
    price: 199.90, category: 'women', subcategory: 'Рокли',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=85',
    ],
    colors: [{ name: 'Черно', hex: '#1a1a1a' }, { name: 'Бежово', hex: '#c8b49a' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Midi рокля с тънки презрамки и деликатен набор в горната част. Идеална за специални поводи.',
    isNew: true, inStock: true, rating: 4.7, reviewCount: 31,
    material: '95% вискоза, 5% еластан', fit: 'Slim fit', care: 'Пране 30°C', season: 'Пролет / Лято', modelInfo: '174 см, носи размер S', sku: 'LX-W-DRS-003-BLK',
  },
  {
    id: 'w4', slug: 'kashmir-pulover', name: 'Кашмирен пуловер', brand: 'DS-Fashion',
    price: 159.90, category: 'women', subcategory: 'Пуловери',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=85',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=85',
    ],
    colors: [{ name: 'Бежово', hex: '#c8b49a' }, { name: 'Черно', hex: '#1a1a1a' }, { name: 'Тъмносиньо', hex: '#1c2951' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Меки кашмирени влакна осигуряват изключителен комфорт и топлина. Безвременен класик.',
    inStock: true, rating: 4.9, reviewCount: 47,
    material: '100% кашмир', fit: 'Relaxed fit', care: 'Ръчно пране студена вода', season: 'Есен / Зима', modelInfo: '173 см, носи размер S', sku: 'LX-W-KNI-004-BEI',
  },
  {
    id: 'w5', slug: 'pantalon-milano', name: 'Панталон Milano', brand: 'DS-Fashion',
    price: 159.90, category: 'women', subcategory: 'Панталони',
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=85',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&q=85',
    ],
    colors: [{ name: 'Бежово', hex: '#c8b49a' }, { name: 'Черно', hex: '#1a1a1a' }, { name: 'Кафяво', hex: '#6b4c3b' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Широк крачол с висока талия. Изработен от смес с лен за перфектен силует в топлите сезони.',
    inStock: true, rating: 4.6, reviewCount: 22,
    material: '55% лен, 45% памук', fit: 'Wide fit', care: 'Пране 40°C', season: 'Пролет / Лято', modelInfo: '175 см, носи размер S', sku: 'LX-W-PAN-005-BEI',
  },
  {
    id: 'w6', slug: 'palto-premium', name: 'Палто Premium', brand: 'DS-Fashion',
    price: 349.90, category: 'women', subcategory: 'Палта и якета',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=85',
      'https://images.unsplash.com/photo-1548624313-0396a54c3e38?w=800&q=85',
    ],
    colors: [{ name: 'Камел', hex: '#c19a6b' }, { name: 'Черно', hex: '#1a1a1a' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Класическо пало с двуредно закопчаване и структуриран силует. Най-добрата инвестиция за гардероба.',
    isNew: true, inStock: true, rating: 5.0, reviewCount: 12,
    material: '80% вълна, 20% найлон', fit: 'Slim fit', care: 'Химическо чистене', season: 'Есен / Зима', modelInfo: '176 см, носи размер S', sku: 'LX-W-COT-006-CAM',
  },
  {
    id: 'w7', slug: 'pola-satin', name: 'Пола Satin', brand: 'DS-Fashion',
    price: 129.90, category: 'women', subcategory: 'Поли',
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=85',
      'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&q=85',
    ],
    colors: [{ name: 'Слонова кост', hex: '#fffff0' }, { name: 'Кафяво', hex: '#6b4c3b' }, { name: 'Черно', hex: '#1a1a1a' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Midi пола от атласена тъкан с мек блясък и лек, плавен силует. Универсална и лесна за съчетаване.',
    inStock: true, rating: 4.7, reviewCount: 29,
    material: '100% полиестер (атлас)', fit: 'Regular fit', care: 'Ръчно пране 30°C', season: 'Целогодишно', modelInfo: '174 см, носи размер S', sku: 'LX-W-SKI-007-IVO',
  },
  {
    id: 'w8', slug: 'chanta-signature', name: 'Чанта Signature', brand: 'DS-Fashion',
    price: 249.90, category: 'accessories', subcategory: 'Чанти',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85',
    ],
    colors: [{ name: 'Черно', hex: '#1a1a1a' }, { name: 'Камел', hex: '#c19a6b' }, { name: 'Бордо', hex: '#800020' }],
    sizes: ['ONE SIZE'],
    description: 'Структурирана чанта от телешка кожа с метален ремък и логото на марката. Тимелест дизайн.',
    inStock: true, rating: 4.9, reviewCount: 38,
    material: '100% телешка кожа', fit: '-', care: 'Кожен крем', season: 'Целогодишно', modelInfo: '-', sku: 'LX-A-BAG-008-BLK',
  },

  // MEN
  {
    id: 'm1', slug: 'cherno-hudi-premium', name: 'Черно худи Premium', brand: 'DS-Fashion',
    price: 89.90, category: 'men', subcategory: 'Суитчъри и худита',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=85',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=85',
      'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=85',
      'https://images.unsplash.com/photo-1614093302611-8efc4c56a1d9?w=800&q=85',
    ],
    colors: [{ name: 'Черно', hex: '#1a1a1a' }, { name: 'Бежово', hex: '#c8b49a' }, { name: 'Сиво', hex: '#9e9e9e' }, { name: 'Тъмносиньо', hex: '#1c2951' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Минималистичен дизайн, максимално въздействие. Изработено от висококачествен памук с мека вътрешна страна за усещане за комфорт през целия ден.',
    isNew: true, inStock: true, rating: 4.9, reviewCount: 32,
    material: '100% органичен памук', fit: 'Regular fit', care: 'Пране 30°C, не сушите в сушилня, гладете се на ниска температура', season: 'Пролет / Есен / Зима', modelInfo: '188 см / 75 кг и носи размер M', sku: 'LX-M-HOOD-001-BLK',
  },
  {
    id: 'm2', slug: 'bazova-teniska', name: 'Базова тениска', brand: 'DS-Fashion',
    price: 49.90, category: 'men', subcategory: 'Тениски',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=85',
    ],
    colors: [{ name: 'Бяло', hex: '#f5f5f5' }, { name: 'Черно', hex: '#1a1a1a' }, { name: 'Бежово', hex: '#c8b49a' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Класическа тениска с О-образно деколте от 100% органичен памук. Мека, издръжлива, безвременна.',
    inStock: true, rating: 4.8, reviewCount: 64,
    material: '100% органичен памук', fit: 'Regular fit', care: 'Пране 40°C', season: 'Целогодишно', modelInfo: '187 см, носи размер M', sku: 'LX-M-TEE-002-WHT',
  },
  {
    id: 'm3', slug: 'bezovo-hudi', name: 'Бежово худи Premium', brand: 'DS-Fashion',
    price: 89.90, category: 'men', subcategory: 'Суитчъри и худита',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85',
      'https://images.unsplash.com/photo-1618453292459-53424b66bb6a?w=800&q=85',
    ],
    colors: [{ name: 'Бежово', hex: '#c8b49a' }, { name: 'Черно', hex: '#1a1a1a' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Едно от любимите ни, сега в бежово. Мека вътрешна страна за максимален комфорт.',
    inStock: true, rating: 4.7, reviewCount: 28,
    material: '100% органичен памук', fit: 'Regular fit', care: 'Пране 30°C', season: 'Пролет / Есен', modelInfo: '188 см / 75 кг, носи размер M', sku: 'LX-M-HOOD-003-BEI',
  },
  {
    id: 'm4', slug: 'valnena-riza', name: 'Вълнена риза Overshirt', brand: 'DS-Fashion',
    price: 129.90, category: 'men', subcategory: 'Ризи',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=85',
      'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=85',
    ],
    colors: [{ name: 'Кафяво', hex: '#6b4c3b' }, { name: 'Тъмносиньо', hex: '#1c2951' }],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Топла overshirt риза от вълна, подходяща за носене като якетce. Двойно закопчаване с копчета.',
    inStock: true, rating: 4.6, reviewCount: 15,
    material: '80% вълна, 20% найлон', fit: 'Relaxed fit', care: 'Ръчно пране 30°C', season: 'Есен / Зима', modelInfo: '187 см, носи размер L', sku: 'LX-M-SHI-004-BRW',
  },
  {
    id: 'm5', slug: 'pantalon-milano-men', name: 'Панталон Milano', brand: 'DS-Fashion',
    price: 119.90, category: 'men', subcategory: 'Панталони',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=85',
      'https://images.unsplash.com/photo-1624378441864-6eda7eac51cb?w=800&q=85',
    ],
    colors: [{ name: 'Бежово', hex: '#c8b49a' }, { name: 'Черно', hex: '#1a1a1a' }, { name: 'Сиво', hex: '#9e9e9e' }],
    sizes: ['30', '32', '34', '36', '38'],
    description: 'Прав крачол с леко стесняване. Висококачествен памучен сатен с минимална грижа.',
    inStock: true, rating: 4.7, reviewCount: 19,
    material: '100% памук', fit: 'Slim straight', care: 'Пране 40°C', season: 'Целогодишно', modelInfo: '188 см, носи размер 32', sku: 'LX-M-PAN-005-BEI',
  },
  {
    id: 'm6', slug: 'kaska-signature', name: 'Каскет Signature', brand: 'DS-Fashion',
    price: 39.90, category: 'accessories', subcategory: 'Шапки',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=85',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=85',
    ],
    colors: [{ name: 'Черно', hex: '#1a1a1a' }, { name: 'Бежово', hex: '#c8b49a' }],
    sizes: ['ONE SIZE'],
    description: 'Класически каскет с бродирано лого. Регулируем каишка отзад за перфектно прилягане.',
    inStock: true, rating: 4.5, reviewCount: 42,
    material: '100% памук', fit: '-', care: 'Ръчно пране', season: 'Целогодишно', modelInfo: '-', sku: 'LX-A-CAP-006-BLK',
  },

  // ACCESSORIES
  {
    id: 'a1', slug: 'kashmir-shal', name: 'Кашмирен шал', brand: 'DS-Fashion',
    price: 89.90, category: 'accessories', subcategory: 'Шалове',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=85',
      'https://images.unsplash.com/photo-1548531608-2f7fa3ce91f6?w=800&q=85',
    ],
    colors: [{ name: 'Камел', hex: '#c19a6b' }, { name: 'Черно', hex: '#1a1a1a' }, { name: 'Сиво', hex: '#9e9e9e' }],
    sizes: ['ONE SIZE'],
    description: '100% кашмирен шал с деликатна текстура. Меко, топло и луксозно допълнение.',
    inStock: true, rating: 4.8, reviewCount: 21,
    material: '100% кашмир', fit: '-', care: 'Ръчно пране студена вода', season: 'Есен / Зима', modelInfo: '-', sku: 'LX-A-SCA-001-CAM',
  },
  {
    id: 'a2', slug: 'ochila-signature', name: 'Слънчеви очила Signature', brand: 'DS-Fashion',
    price: 89.90, category: 'accessories', subcategory: 'Очила',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=85',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=85',
    ],
    colors: [{ name: 'Черно', hex: '#1a1a1a' }, { name: 'Кафяво', hex: '#6b4c3b' }],
    sizes: ['ONE SIZE'],
    description: 'Тъмни стъкла с UV400 защита. Ацетатна рамка с пролетен шарнир. Включена кутия.',
    inStock: true, rating: 4.6, reviewCount: 33,
    material: 'Ацетат / поликарбонат', fit: '-', care: 'Избърсвайте с мека кърпа', season: 'Целогодишно', modelInfo: '-', sku: 'LX-A-SUN-002-BLK',
  },
];

export const MOCK_TESTIMONIALS = [
  { id: 't1', name: 'Мария П.', rating: 5, text: 'Невероятно качество и усещане. Любимият ми магазин за базови дрехи!' },
  { id: 't2', name: 'Иван Д.', rating: 5, text: 'Бърза доставка и отлично обслужване. Препоръчвам ги за всеки повод.' },
  { id: 't3', name: 'Елена С.', rating: 5, text: 'Материите са невероятни, а моделите са с векове напред от другите марки.' },
];

export const MOCK_CART_ITEMS = [
  {
    id: 'cart-1', productId: 'm1', name: 'Черно худи', color: 'Черно', size: 'M',
    price: 89.90, quantity: 1,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&q=80',
  },
  {
    id: 'cart-2', productId: 'w6', name: 'Бежово палто Milano', color: 'Бежово', size: 'S',
    price: 199.90, quantity: 1,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=300&q=80',
  },
  {
    id: 'cart-3', productId: 'w8', name: 'Черна кожена чанта', color: 'Черно', size: 'One Size',
    price: 129.90, quantity: 1,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80',
  },
];

export const WOMEN_CATEGORIES = [
  { name: 'Всички продукти', count: 168 },
  { name: 'Рокли', count: 36 },
  { name: 'Блузи и ризи', count: 42 },
  { name: 'Панталони', count: 28 },
  { name: 'Поли', count: 18 },
  { name: 'Пола и якета', count: 22 },
  { name: 'Трикотаж', count: 22 },
];
