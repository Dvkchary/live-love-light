import { Product } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'teddy-candle-001',
    name: 'Teddy Candle — Royal Oud',
    slug: 'teddy-candle-royal-oud',
    description: 'An adorable, delicately hand-carved teddy bear candle sculpted in 100% botanical soy wax and infused with deep, velvety royal oud and cozy amber notes. Perfect as a heartwarming keepsake or luxury gift.',
    fragrance: 'Royal Oud & Cozy Amber',
    fragranceNotes: {
      top: 'Sweet Bergamot, Warm Cardamom',
      middle: 'Smoky Agarwood (Oud), Cedar',
      base: 'Velvet Amber, Madagascar Vanilla'
    },
    price: 399,
    originalPrice: 599,
    currency: 'INR',
    category: 'Teddy Candles',
    images: [
      '/images/teddy-royal-oud.png',
      '/images/04-beautiful-details.png',
      '/images/03-pouring-with-care.png'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-teddy-candle',
      flipkart: 'https://www.flipkart.com/example-teddy-candle',
      meesho: 'https://www.meesho.com/example-teddy-candle'
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 40,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 220,
    dimensions: '8.5 x 7 x 6 cm',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'daisy-jasmine-002',
    name: 'Daisy Flower Candle — Blooming Jasmine',
    slug: 'daisy-flower-candle-jasmine',
    description: 'A delicately sculpted floral daisy candle infused with pure sweet blooming jasmine fragrance. Hand-carved petal by petal, bringing springtime freshness into your living space.',
    fragrance: 'Blooming Jasmine',
    fragranceNotes: {
      top: 'Dewy Greens, Wild Citrus Blossom',
      middle: 'Night Blooming Jasmine, White Lily',
      base: 'Soft White Musk, Sheer Wood'
    },
    price: 349,
    originalPrice: 499,
    currency: 'INR',
    category: 'Flower Candles',
    images: [
      '/images/daisy-jasmine.png',
      '/images/01-handcrafted-candles.png',
      '/images/05-lighting-moment.png'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-daisy-jasmine',
      flipkart: 'https://www.flipkart.com/example-daisy-jasmine',
      meesho: ''
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 45,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 180,
    dimensions: '7.5 x 7.5 x 5 cm',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'peony-rose-003',
    name: 'Peony Rose Candle — Velvet Rose & Royal Oud',
    slug: 'peony-rose-candle-jasmine-oud',
    description: 'An exquisite multi-layered sculpted peony flower candle blending romantic crimson rose petals with prestigious warm royal oud. Designed to cast a romantic glow across intimate evenings.',
    fragrance: 'Velvet Rose & Royal Oud',
    fragranceNotes: {
      top: 'Damask Rose Petals, Pink Peppercorn',
      middle: 'Velvety Peony, Geranium Blossom',
      base: 'Dark Smoky Oud, Warm Praline'
    },
    price: 449,
    originalPrice: 649,
    currency: 'INR',
    category: 'Rose Candles',
    images: [
      '/images/peony-jasmine-royal-oud.png',
      '/images/04-beautiful-details.png',
      '/images/01-handcrafted-candles.png'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-peony-rose',
      flipkart: '',
      meesho: 'https://www.meesho.com/example-peony-rose'
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 55,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 240,
    dimensions: '8 x 8 x 6.5 cm',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'lotus-sandalwood-004',
    name: 'Lotus Flower Candle — Mysore Sandalwood',
    slug: 'lotus-flower-candle-sandalwood',
    description: 'A serenely sculpted blooming sacred lotus candle infused with authentic Mysore sandalwood aroma. Perfect for meditation, yoga nooks, mindful evenings, and peaceful relaxation.',
    fragrance: 'Mysore Sandalwood & Sacred Amber',
    fragranceNotes: {
      top: 'Crisp Cardamom, Golden Saffron',
      middle: 'Calming Mysore Sandalwood, Frankincense',
      base: 'Earthy Patchouli, Sacred Amber'
    },
    price: 379,
    originalPrice: 549,
    currency: 'INR',
    category: 'Flower Candles',
    images: [
      '/images/lotus-sandalwood.png',
      '/images/05-lighting-moment.png',
      '/images/02-fragrance-oils.png'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-lotus-candle',
      flipkart: 'https://www.flipkart.com/example-lotus-candle',
      meesho: 'https://www.meesho.com/example-lotus-candle'
    },
    featured: false,
    active: true,
    inStock: true,
    burnTimeHours: 50,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 200,
    dimensions: '9 x 9 x 4.5 cm',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z'
  },
  {
    id: 'jar-royal-oud-005',
    name: 'Amber Glass Jar Candle — Royal Oud',
    slug: 'amber-glass-jar-candle-royal-oud',
    description: 'A prestige apothecary amber glass vessel candle with wooden crackling wick, saturated with opulent royal oud and aged cedarwood. Delivers long-lasting, sophisticated room ambiance.',
    fragrance: 'Royal Oud & Aged Cedar',
    fragranceNotes: {
      top: 'Incense Smoke, Nutmeg',
      middle: 'Royal Arabian Oud, Dark Birch',
      base: 'Leather Accord, Golden Amber, Vetiver'
    },
    price: 549,
    originalPrice: 799,
    currency: 'INR',
    category: 'Fragrance Candles',
    images: [
      '/images/jar-royal-oud.png',
      '/images/02-fragrance-oils.png',
      '/images/05-lighting-moment.png'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-amber-jar-oud',
      flipkart: 'https://www.flipkart.com/example-amber-jar-oud',
      meesho: ''
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 65,
    waxType: 'Botanical Coconut & Beeswax Blend',
    weightGrams: 320,
    dimensions: '8 x 8 x 9.5 cm',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'gift-collection-006',
    name: 'Artisan Handcrafted Gift Box Collection',
    slug: 'artisan-gift-box-collection',
    description: 'A curated luxury gift set featuring our signature sculpted floral and teddy candles presented in a warm gold-embossed gift box with silk ribbon. The ultimate festive, wedding, or anniversary present.',
    fragrance: 'Assorted Luxe Blends (4 Scents)',
    fragranceNotes: {
      top: 'Blooming Jasmine, Mysore Sandalwood',
      middle: 'Velvet Rose, Royal Oud',
      base: 'Golden Amber & French Vanilla'
    },
    price: 1299,
    originalPrice: 1899,
    currency: 'INR',
    category: 'Gift Collections',
    images: [
      '/images/collection-grid.png',
      '/images/01-handcrafted-candles.png',
      '/images/04-beautiful-details.png'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-gift-collection',
      flipkart: 'https://www.flipkart.com/example-gift-collection',
      meesho: 'https://www.meesho.com/example-gift-collection'
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 120,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 750,
    dimensions: '22 x 18 x 9 cm',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z'
  },
  {
    id: 'decorative-candle-007',
    name: 'Artisan Sculpted Heritage Pillar Candle',
    slug: 'artisan-sculpted-heritage-candle',
    description: 'An architectural statement piece candle poured with precision micro-layering. Infused with soft vanilla orchid and cashmere wood to add tactile luxury to dining tables and mantels.',
    fragrance: 'Vanilla Orchid & Cashmere Wood',
    fragranceNotes: {
      top: 'White Peach, Almond Blossom',
      middle: 'Vanilla Orchid, Heliotrope',
      base: 'Cashmere Wood, Warm Musk'
    },
    price: 429,
    originalPrice: 599,
    currency: 'INR',
    category: 'Decorative Candles',
    images: [
      '/images/03-pouring-with-care.png',
      '/images/01-handcrafted-candles.png',
      '/images/04-beautiful-details.png'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-heritage-pillar',
      flipkart: '',
      meesho: ''
    },
    featured: false,
    active: true,
    inStock: true,
    burnTimeHours: 48,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 260,
    dimensions: '7 x 7 x 12 cm',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z'
  }
];

export const INITIAL_CATEGORIES = [
  'Teddy Candles',
  'Flower Candles',
  'Rose Candles',
  'Fragrance Candles',
  'Decorative Candles',
  'Gift Collections'
];
