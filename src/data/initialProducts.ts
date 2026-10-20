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
  },
  // ── New products from Meesho listings ──────────────────────────────────────
  {
    id: 'meesho-daisy-flowers-007',
    name: 'Daisy Flowers Scented Candle (Pack of 4)',
    slug: 'daisy-flowers-scented-candle-pack-of-4',
    description: 'A vibrant set of 4 hand-crafted daisy flower shaped scented candles in a gorgeous mix of red, yellow, and pink hues. Each petal-detailed bloom candle adds a cheerful pop of colour and a light, pleasant scent to any room, making it a delightful gift or home décor piece.',
    fragrance: 'Floral Scented',
    fragranceNotes: {
      top: 'Fresh Daisy, Spring Blooms',
      middle: 'Soft Petals, Light Greens',
      base: 'Clean White Musk'
    },
    price: 193,
    originalPrice: 198,
    currency: 'INR',
    category: 'Flower Candles',
    images: [
      'https://images.meesho.com/images/products/s-1123997239/1_512.webp',
      'https://images.meesho.com/images/products/s-1123997239/2_512.webp'
    ],
    marketplaces: {
      meesho: 'https://meesho.com/daisy-flowers-candlescented-candle/p/il75tj'
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 20,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 100,
    dimensions: '4 x 4 x 1.5 cm (each)',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'meesho-hand-in-hand-008',
    name: 'Hand in Hand Heart Scented Candle',
    slug: 'hand-in-hand-heart-scented-candle',
    description: "A romantic and artistic hand-sculpted candle featuring a delicate hand cradled inside a red heart — the perfect symbol of love and care. Made from premium scented wax, this heart-shaped candle makes a heartfelt gift for anniversaries, Valentine's Day, or any special occasion.",
    fragrance: 'Rose & Sweet Florals',
    fragranceNotes: {
      top: 'Red Rose, Fresh Petals',
      middle: 'Sweet Florals, Soft Jasmine',
      base: 'Warm Musk, Sandalwood'
    },
    price: 288,
    originalPrice: 296,
    currency: 'INR',
    category: 'Rose Candles',
    images: [
      'https://images.meesho.com/images/products/s-1126216473/1_512.webp',
      'https://images.meesho.com/images/products/s-1126216473/2_512.webp'
    ],
    marketplaces: {
      meesho: 'https://meesho.com/hand-in-hand-scented-candles-pack-of-1/p/imiq6x'
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 30,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 200,
    dimensions: '10 x 10 x 5 cm',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'meesho-lotus-fragrance-009',
    name: 'Lotus Fragrance Candle',
    slug: 'lotus-fragrance-candle',
    description: 'A beautifully sculpted hot-pink lotus flower candle radiating serene lotus fragrance. The multi-layered petal design captures the sacred beauty of the blooming lotus, making it ideal for meditation spaces, spa settings, home décor, or as a thoughtful gift to bring peace and positivity.',
    fragrance: 'Sacred Lotus & Water Lily',
    fragranceNotes: {
      top: 'Aquatic Lotus, Fresh Water',
      middle: 'Water Lily, Soft Petals',
      base: 'Earthy Calm, White Musk'
    },
    price: 242,
    originalPrice: 249,
    currency: 'INR',
    category: 'Flower Candles',
    images: [
      'https://images.meesho.com/images/products/s-1124177911/1_512.webp',
      'https://images.meesho.com/images/products/s-1124177911/2_512.webp',
      'https://images.meesho.com/images/products/s-1124177911/3_512.webp'
    ],
    marketplaces: {
      meesho: 'https://meesho.com/lotus-fragrance-candles/p/ilb187'
    },
    featured: false,
    active: true,
    inStock: true,
    burnTimeHours: 25,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 100,
    dimensions: '7 x 7 x 4 cm',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'meesho-teddy-premium-010',
    name: 'Teddy Premium Scented Candles (Pack of 2)',
    slug: 'teddy-premium-scented-candles-pack-of-2',
    description: "An adorable pack of 2 premium teddy bear shaped scented candles in cute pastel pink and mint green colours. These fluffy textured bear candles bring a playful, cozy charm to any space and make the most darling gift for birthdays, baby showers, or simply to brighten someone's day.",
    fragrance: 'Soft Florals & Sweet Musk',
    fragranceNotes: {
      top: 'Soft Powder, Light Florals',
      middle: 'Sweet Cotton, Warm Vanilla',
      base: 'Cozy Musk, Amber'
    },
    price: 156,
    originalPrice: 160,
    currency: 'INR',
    category: 'Teddy Candles',
    images: [
      'https://images.meesho.com/images/products/s-1124241244/1_512.webp',
      'https://images.meesho.com/images/products/s-1124241244/2_512.webp',
      'https://images.meesho.com/images/products/s-1124241244/3_512.webp'
    ],
    marketplaces: {
      meesho: 'https://meesho.com/teddy-premium-scented-candles-pack-of-2/p/ilce3g'
    },
    featured: true,
    active: true,
    inStock: true,
    burnTimeHours: 15,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 80,
    dimensions: '4 x 3 x 5 cm (each)',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'meesho-mini-heart-011',
    name: 'Mini Heart Scented Candles (Set of 5)',
    slug: 'mini-heart-scented-candles-set-of-5',
    description: 'A charming set of 5 mini heart-shaped scented tealight candles in a rainbow of colours — pink, orange, red, green, and white. Each tiny heart candle glows beautifully and fills the room with a delicate fragrance. Perfect for table décor, gifting, celebrations, or creating a romantic ambiance.',
    fragrance: 'Mixed Floral & Sweet',
    fragranceNotes: {
      top: 'Fruity Florals, Sweet Berries',
      middle: 'Rose, Jasmine',
      base: 'Soft Musk, Light Vanilla'
    },
    price: 194,
    originalPrice: 199,
    currency: 'INR',
    category: 'Decorative Candles',
    images: [
      'https://images.meesho.com/images/products/s-1124291666/1_512.webp',
      'https://images.meesho.com/images/products/s-1124291666/2_512.webp'
    ],
    marketplaces: {
      meesho: 'https://meesho.com/mini-heart-scented-candles-set-of-5/p/ildh02'
    },
    featured: false,
    active: true,
    inStock: true,
    burnTimeHours: 10,
    waxType: '100% Botanical Soy Wax',
    weightGrams: 50,
    dimensions: '3 x 3 x 1.5 cm (each)',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z'
  }
];

export const INITIAL_CATEGORIES = [
  'Teddy Candles',
  'Flower Candles',
  'Rose Candles',
  'Fragrance Candles',
  'Decorative Candles'
];
