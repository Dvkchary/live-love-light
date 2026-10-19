import { Product } from '@/types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'teddy-candle-001',
    name: 'Teddy Candle — Royal Oud (Set of 2)',
    slug: 'teddy-candle-royal-oud',
    description: 'An adorable, delicately hand-carved teddy bear candle sculpted in 100% botanical soy wax and infused with deep, velvety royal oud and cozy amber notes. Comes as a set of 2. Perfect as a heartwarming keepsake or luxury gift.',
    fragrance: 'Royal Oud & Cozy Amber',
    fragranceNotes: {
      top: 'Sweet Bergamot, Warm Cardamom',
      middle: 'Smoky Agarwood (Oud), Cedar',
      base: 'Velvet Amber, Madagascar Vanilla'
    },
    price: 200,
    originalPrice: 399,
    currency: 'INR',
    category: 'Teddy Candles',
    images: [
      '/images/teddy - Royal oud-set of 2 -200.jpeg'
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
    name: 'Daisy Jar Candle — Blooming Jasmine',
    slug: 'daisy-flower-candle-jasmine',
    description: 'A delicately sculpted floral daisy jar candle infused with pure sweet blooming jasmine fragrance. Hand-carved petal by petal, bringing springtime freshness into your living space.',
    fragrance: 'Blooming Jasmine',
    fragranceNotes: {
      top: 'Dewy Greens, Wild Citrus Blossom',
      middle: 'Night Blooming Jasmine, White Lily',
      base: 'Soft White Musk, Sheer Wood'
    },
    price: 299,
    originalPrice: 499,
    currency: 'INR',
    category: 'Flower Candles',
    images: [
      '/images/daisy - jasmine-299 jar candle.jpeg'
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
    id: 'flower-candle-006',
    name: 'Flower Candle — Artisan Bloom',
    slug: 'flower-candle-artisan-bloom',
    description: 'A beautifully hand-crafted artisan flower candle made with 100% botanical soy wax. Delicately shaped petals that glow warmly when lit, making it a stunning centrepiece for any setting.',
    fragrance: 'Fresh Blooms',
    fragranceNotes: {
      top: 'Spring Petals, Green Leaves',
      middle: 'Tuberose, White Floral',
      base: 'Soft Musk, Warm Cedar'
    },
    price: 200,
    originalPrice: 349,
    currency: 'INR',
    category: 'Flower Candles',
    images: [
      '/images/flower candle 200.jpeg'
    ],
    marketplaces: {
      amazon: 'https://www.amazon.in/dp/example-flower-candle',
      flipkart: 'https://www.flipkart.com/example-flower-candle',
      meesho: 'https://www.meesho.com/example-flower-candle'
    },
    featured: false,
    active: true,
    inStock: true,
    burnTimeHours: 35,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 160,
    dimensions: '8 x 8 x 5 cm',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z'
  },
  {
    id: 'peony-rose-003',
    name: 'Peony Rose Candle — Jasmine & Royal Oud (Couple Set)',
    slug: 'peony-rose-candle-jasmine-oud',
    description: 'An exquisite couple set of multi-layered sculpted peony flower candles blending romantic jasmine with prestigious warm royal oud. Designed to cast a romantic glow across intimate evenings. Perfect as a couples gift.',
    fragrance: 'Jasmine & Royal Oud',
    fragranceNotes: {
      top: 'Damask Rose Petals, Pink Peppercorn',
      middle: 'Velvety Peony, Night Jasmine',
      base: 'Dark Smoky Royal Oud, Warm Praline'
    },
    price: 400,
    originalPrice: 649,
    currency: 'INR',
    category: 'Rose Candles',
    images: [
      '/images/peony - jamsine & Royal oud- couple 400.jpeg'
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
    name: 'Lotus Flower Candle — Mysore Sandalwood (Pack of 4)',
    slug: 'lotus-flower-candle-sandalwood',
    description: 'A serenely sculpted blooming sacred lotus candle infused with authentic Mysore sandalwood aroma. Comes in a pack of 4. Perfect for meditation, yoga nooks, mindful evenings, and peaceful relaxation.',
    fragrance: 'Mysore Sandalwood & Sacred Amber',
    fragranceNotes: {
      top: 'Crisp Cardamom, Golden Saffron',
      middle: 'Calming Mysore Sandalwood, Frankincense',
      base: 'Earthy Patchouli, Sacred Amber'
    },
    price: 200,
    originalPrice: 399,
    currency: 'INR',
    category: 'Flower Candles',
    images: [
      '/images/lotus - sandlewood-pack of 4 -200.jpeg'
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
    price: 200,
    originalPrice: 399,
    currency: 'INR',
    category: 'Fragrance Candles',
    images: [
      '/images/jar - rayal oud-200.jpeg'
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
  }
];

export const INITIAL_CATEGORIES = [
  'Teddy Candles',
  'Flower Candles',
  'Rose Candles',
  'Fragrance Candles'
];
