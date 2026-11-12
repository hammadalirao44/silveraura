import { Product } from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_silver_aura_1794482387330.jpg';
export const CRAFTSMANSHIP_IMAGE = '/src/assets/images/craftsmanship_atelier_1794482389145.jpg';
export const CATEGORY_RINGS_IMAGE = '/src/assets/images/category_rings_1794482387362.jpg';
export const CATEGORY_NECKLACES_IMAGE = '/src/assets/images/category_necklaces_1794482386916.jpg';
export const CATEGORY_EARRINGS_IMAGE = '/src/assets/images/category_earrings_1794482389310.jpg';

export const PRODUCTS: Product[] = [
  // --- RINGS ---
  {
    id: 'sa-ring-01',
    name: 'Astrid Solitaire Pavé Band',
    category: 'Rings',
    price: 6450,
    originalPrice: 7800,
    images: [
      '/src/assets/images/category_rings_1794482387362.jpg',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'An ethereal classic reimagined. Features a brilliant-cut center AAA cubic zirconia embraced by micro-pavé hand-set stones along a tapered solid 925 sterling silver band. Rhodium dipped for enduring mirror shine and anti-tarnish protection.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Triple Rhodium Anti-Tarnish Coating',
    stone: 'AAA Flawless Swiss Zirconia (1.5 ct eq)',
    weight: '3.6 grams',
    hallmark: '925 Laser Stamped',
    sizes: ['5', '6', '7', '8', '9'],
    inStock: true,
    stockCount: 8,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.9,
    reviewCount: 42,
    careNotes: [
      'Store in the provided anti-tarnish velvet pouch',
      'Gently wipe with microfiber polishing cloth after wear',
      'Avoid contact with perfume, chlorinated water and harsh household detergents'
    ]
  },
  {
    id: 'sa-ring-02',
    name: 'Céleste Dual Orbit Eternity Ring',
    category: 'Rings',
    price: 5200,
    originalPrice: 6200,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_rings_1794482387362.jpg',
    ],
    description: 'Interlocking twin ribbons of hand-polished sterling silver, one glistening with micro-grain zirconias and one reflecting pure mirror silver. Seamlessly merges celestial elegance with everyday stackability.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Electroplated White Rhodium',
    stone: 'Micro-Grain Pavé Zirconia',
    weight: '4.1 grams',
    hallmark: '925 Laser Stamped',
    sizes: ['6', '7', '8', '9'],
    inStock: true,
    stockCount: 12,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.8,
    reviewCount: 28,
    careNotes: [
      'Keep away from thermal sulfur springs and chlorine',
      'Clean periodically with lukewarm soapy water and soft brush'
    ]
  },
  {
    id: 'sa-ring-03',
    name: 'Lyra Minimalist Hammered Band',
    category: 'Rings',
    price: 3850,
    images: [
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_rings_1794482387362.jpg',
    ],
    description: 'Subtle hand-hammered facets catch shifting ambient light across an artisanal rounded silhouette. Hand-forged by Lahore silversmiths with comfort-fit interior contouring.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Natural Polished Silver',
    stone: 'None (Pure Silver Finish)',
    weight: '4.8 grams',
    hallmark: '925 Laser Stamped',
    sizes: ['5', '6', '7', '8', '9', '10'],
    inStock: true,
    stockCount: 15,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.9,
    reviewCount: 19,
    careNotes: [
      'Develops a charming natural patina over decades',
      'Use the complimentary Silver Aura polishing cloth to restore mirror luster'
    ]
  },
  {
    id: 'sa-ring-04',
    name: 'Nocturne Emerald-Cut Moonstone Ring',
    category: 'Rings',
    price: 7950,
    originalPrice: 9500,
    images: [
      '/src/assets/images/hero_silver_aura_1794482387330.jpg',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'A genuine iridescent natural rainbow moonstone set in a classic four-prong bezel on an architectural signet-inspired sterling silver chassis. Radiates cool blue adularescence under natural light.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Platinum Rhodium Shield',
    stone: 'Natural Rainbow Moonstone & Blue Topaz accents',
    weight: '5.2 grams',
    hallmark: '925 Laser Stamped',
    sizes: ['6', '7', '8'],
    inStock: true,
    stockCount: 5,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    rating: 5.0,
    reviewCount: 31,
    careNotes: [
      'Natural gemstones require tender handling; protect from hard impacts',
      'Remove during rigorous fitness activities'
    ]
  },

  // --- NECKLACES ---
  {
    id: 'sa-neck-01',
    name: 'Serena Floating Zirconia Choker',
    category: 'Necklaces',
    price: 7200,
    originalPrice: 8500,
    images: [
      '/src/assets/images/category_necklaces_1794482386916.jpg',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'A bezel-set brilliant round zirconia suspended weightlessly along a micro-cable Italian chain. Sits flush at the collarbone with an adjustable 2-inch extender chain for tailored styling.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Anti-Tarnish Rhodium Finish',
    stone: 'Brilliant Round Cut Zirconia',
    weight: '3.8 grams',
    hallmark: '925 Laser Inscription on Clasp',
    sizes: ['16 inch + 2 inch Extender'],
    inStock: true,
    stockCount: 14,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.9,
    reviewCount: 56,
    careNotes: [
      'Fasten clasp prior to storing to prevent delicate knotting',
      'Wipe down after wearing with soft flannel cloth'
    ]
  },
  {
    id: 'sa-neck-02',
    name: 'Aurelia Layered Figaro Chain',
    category: 'Necklaces',
    price: 6100,
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_necklaces_1794482386916.jpg',
    ],
    description: 'Timeless Italian Figaro chain featuring elongated mirror-flat oval links alternating with circular diamond-cut links. Substantial yet featherweight on the neck, perfect solo or layered.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Mirror-Polished Natural Rhodium',
    stone: 'None',
    weight: '6.4 grams',
    hallmark: '925 Italy Stamped',
    sizes: ['18 inch', '20 inch'],
    inStock: true,
    stockCount: 9,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.8,
    reviewCount: 39,
    careNotes: [
      'Lay flat in jewellery drawer when not in use',
      'Clean periodically with silver dip or gentle foam'
    ]
  },
  {
    id: 'sa-neck-03',
    name: 'Mirana Raw Moonstone Statement Collar',
    category: 'Necklaces',
    price: 13500,
    originalPrice: 16000,
    images: [
      '/src/assets/images/hero_silver_aura_1794482387330.jpg',
      '/src/assets/images/category_necklaces_1794482386916.jpg',
    ],
    description: 'The crowning statement of our Heritage Capsule. Hand-forged organic textured oval links frame a constellation of graduated cabochon moonstones and ice-blue topaz gems. An heirloom treasure.',
    silverPurity: 'Solid 925 Sterling Silver (92.5% Fine Silver)',
    plating: 'Oxidized Antique Rhodium Accent',
    stone: 'Graduated Rainbow Moonstone & Swiss Blue Topaz',
    weight: '18.7 grams',
    hallmark: '925 AG Master Jeweller Stamp',
    sizes: ['17 inch + 2.5 inch Extender'],
    inStock: true,
    stockCount: 3,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    rating: 5.0,
    reviewCount: 18,
    careNotes: [
      'Comes with handcrafted luxury walnut presentation box',
      'Annual studio complimentary cleaning certificate included'
    ]
  },
  {
    id: 'sa-neck-04',
    name: 'Elysian Freshwater Pearl Lariat',
    category: 'Necklaces',
    price: 8400,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_necklaces_1794482386916.jpg',
    ],
    description: 'Baroque luminous freshwater pearls nestled along a fluid box chain that cascades into an adjustable drop pendant. Flattering neckline accent for evening attire and weddings.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'High-Gloss Rhodium',
    stone: 'Natural Cultured Freshwater Pearls',
    weight: '7.1 grams',
    hallmark: '925 Stamped',
    sizes: ['Adjustable 16-20 inch'],
    inStock: true,
    stockCount: 7,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.7,
    reviewCount: 14,
    careNotes: [
      'Pearls love moisture from natural skin contact; wear often',
      'Never spray hairspray or perfume directly over pearls'
    ]
  },

  // --- EARRINGS ---
  {
    id: 'sa-ear-01',
    name: 'Sariel Hammered Silver Huggie Hoops',
    category: 'Earrings',
    price: 4500,
    originalPrice: 5400,
    images: [
      '/src/assets/images/category_earrings_1794482389310.jpg',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Sculptural broad-face huggies with hand-stippled organic hammer texture that gleams with soft luminescence. Secure click-latch closure designed for 24/7 effortless wear.',
    silverPurity: 'Solid 925 Sterling Silver (Hypoallergenic)',
    plating: 'Mirror Rhodium Seal',
    stone: 'None',
    weight: '4.9 grams (pair)',
    hallmark: '925 Laser Inscription on Interior Post',
    sizes: ['16mm Diameter'],
    inStock: true,
    stockCount: 18,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.9,
    reviewCount: 64,
    careNotes: [
      'Hypoallergenic post suitable for the most sensitive ears',
      'Clean post regularly with alcohol pad before wearing'
    ]
  },
  {
    id: 'sa-ear-02',
    name: 'Vespera Crystal Teardrop Drops',
    category: 'Earrings',
    price: 5800,
    images: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_earrings_1794482389310.jpg',
    ],
    description: 'A teardrop-cut crystalline zirconia suspended on an articulated silver loop that catches every turn of the head with subtle fire and brilliance.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Platinum Rhodium Bath',
    stone: 'AAA Pear-Cut Crystal Zirconia',
    weight: '3.7 grams',
    hallmark: '925 Stamped',
    sizes: ['24mm Drop Length'],
    inStock: true,
    stockCount: 11,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.8,
    reviewCount: 33,
    careNotes: [
      'Store upright in lined earring box',
      'Polish with non-abrasive silver cloth'
    ]
  },
  {
    id: 'sa-ear-03',
    name: 'Aria Minimalist Stud Pair',
    category: 'Earrings',
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_earrings_1794482389310.jpg',
    ],
    description: 'Crisp four-prong basket setting holding 6mm brilliant-cut zirconias with butterfly push-backs. The quintessential essential stud for everyday luxury.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Pure Rhodium Shield',
    stone: '6mm Round AAA Zirconia',
    weight: '2.1 grams',
    hallmark: '925 Stamped Posts',
    sizes: ['6mm Stone'],
    inStock: true,
    stockCount: 25,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    rating: 4.9,
    reviewCount: 78,
    careNotes: [
      'Includes silicone safety stopper backings along with silver clutches',
      'Safe for showers and sleep'
    ]
  },
  {
    id: 'sa-ear-04',
    name: 'Soleil Radiant Sunburst Ear Climbers',
    category: 'Earrings',
    price: 4900,
    originalPrice: 5900,
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_earrings_1794482389310.jpg',
    ],
    description: 'An architectural curve of bezel-set crystals that follows the natural helix curvature of the earlobe. Secured with a contoured spring wire back.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Anti-Oxidation Rhodium',
    stone: 'Baguette and Round Zirconia',
    weight: '3.4 grams',
    hallmark: '925 Stamped',
    sizes: ['18mm Climber Curve'],
    inStock: true,
    stockCount: 8,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.8,
    reviewCount: 22,
    careNotes: [
      'Gently squeeze wire post to adjust tension for earlobe thickness',
      'Clean stones with damp cotton swab'
    ]
  },

  // --- BRACELETS ---
  {
    id: 'sa-brac-01',
    name: 'Sovereign Tennis Bracelet',
    category: 'Bracelets',
    price: 11500,
    originalPrice: 13900,
    images: [
      'https://images.unsplash.com/photo-1611591475152-47831c367285?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/hero_silver_aura_1794482387330.jpg',
    ],
    description: 'The pinnacle of wrist luxury. Continuous line of hand-matched, individually prong-set 3mm cubic zirconias with a double-safety box clasp. Drapes like liquid light.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Triple Rhodium Plated',
    stone: '3mm Ideal Cut Zirconias (7.5 ctw equivalent)',
    weight: '11.8 grams',
    hallmark: '925 Double Clasp Stamp',
    sizes: ['6.5 inch', '7.0 inch', '7.5 inch'],
    inStock: true,
    stockCount: 6,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    rating: 5.0,
    reviewCount: 47,
    careNotes: [
      'Double safety clip ensures secure lock throughout active wear',
      'Professional ultrasonic cleaning recommended annually'
    ]
  },
  {
    id: 'sa-brac-02',
    name: 'Alora Open Torque Bangle',
    category: 'Bracelets',
    price: 6800,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611591475152-47831c367285?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'A sculpted oval sterling silver cuff featuring tapered sphere terminals. Slightly flexible spring temper allows comfortable slipping over the wrist while keeping form.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Satin & Mirror Polish Rhodium',
    stone: 'None (Solid Heavy Silver)',
    weight: '12.4 grams',
    hallmark: '925 Stamped',
    sizes: ['Small (6.0-6.5")', 'Medium (6.5-7.2")'],
    inStock: true,
    stockCount: 10,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.8,
    reviewCount: 17,
    careNotes: [
      'Widen or tighten only gently from the sides; do not overbend',
      'Wipe down after wearing'
    ]
  },
  {
    id: 'sa-brac-03',
    name: 'Callista Snake Chain Charm Bracelet',
    category: 'Bracelets',
    price: 5400,
    originalPrice: 6200,
    images: [
      'https://images.unsplash.com/photo-1611591475152-47831c367285?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_rings_1794482387362.jpg',
    ],
    description: 'Smooth round snake chain woven from tightly locked silver links, finished with an engraved barrel clasp. Compatible with fine keepsake charms or worn solo.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Bright Rhodium',
    stone: 'None',
    weight: '8.2 grams',
    hallmark: '925 Laser Stamped Clasp',
    sizes: ['17 cm', '19 cm', '21 cm'],
    inStock: true,
    stockCount: 16,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.9,
    reviewCount: 35,
    careNotes: [
      'Do not crimp or bend at sharp 90-degree angles to preserve smooth snake links'
    ]
  },

  // --- ANKLETS ---
  {
    id: 'sa-ank-01',
    name: 'Zephyr Beaded Satellite Anklet',
    category: 'Anklets',
    price: 3600,
    originalPrice: 4200,
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_necklaces_1794482386916.jpg',
    ],
    description: 'Delicate cable chain accented at regular intervals with miniature polished silver beads. Drapes gracefully above the ankle bone with an effortless summer shimmer.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Sweat & Moisture Resistant Rhodium',
    stone: 'None',
    weight: '2.8 grams',
    hallmark: '925 Tag Stamped',
    sizes: ['9 inch + 1.5 inch Extender'],
    inStock: true,
    stockCount: 22,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.9,
    reviewCount: 29,
    careNotes: [
      'Rinse with clear water after seaside or beach wear and pat dry'
    ]
  },
  {
    id: 'sa-ank-02',
    name: 'Kismet Tiny Bells Charm Anklet',
    category: 'Anklets',
    price: 4400,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
      '/src/assets/images/category_necklaces_1794482386916.jpg',
    ],
    description: 'Traditional Pakistani craftsmanship meets modern minimalism. Features micro-ghungroo inspired hollow bells that emit a subtle, whisper-quiet chime with every step.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'High-Polish Sterling Silver',
    stone: 'None',
    weight: '5.1 grams',
    hallmark: '925 Stamped',
    sizes: ['9.5 inch + 1 inch Extender'],
    inStock: true,
    stockCount: 13,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    rating: 5.0,
    reviewCount: 21,
    careNotes: [
      'Handcrafted miniature bells are soldered with care; avoid snagging on knit blankets'
    ]
  },

  // --- JEWELLERY SETS ---
  {
    id: 'sa-set-01',
    name: 'The Bridal Aura 925 Solitaire Suite',
    category: 'Jewellery Sets',
    price: 24500,
    originalPrice: 28500,
    images: [
      '/src/assets/images/hero_silver_aura_1794482387330.jpg',
      '/src/assets/images/category_rings_1794482387362.jpg',
      '/src/assets/images/category_necklaces_1794482386916.jpg',
      '/src/assets/images/category_earrings_1794482389310.jpg',
    ],
    description: 'Our signature bridal and celebration suite. Includes the Astrid Solitaire Pavé Ring, Serena Floating Zirconia Choker Necklace, and Matching Teardrop Drop Earrings presented in our hand-stitched velvet keepsake trunk.',
    silverPurity: 'Solid 925 Sterling Silver (100% Certified)',
    plating: 'Master Platinum Rhodium Shield',
    stone: 'AAA Flawless Swiss Zirconia Suite',
    weight: '24.2 grams combined',
    hallmark: '925 Individually Hallmarked On All 3 Pieces',
    sizes: ['Ring Size 6, 7, or 8 (Selectable)'],
    inStock: true,
    stockCount: 4,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    rating: 5.0,
    reviewCount: 38,
    careNotes: [
      'Includes Certificate of Authenticity and 1-Year Rhodium Replating Warranty',
      'Comes packaged in signature Silver Aura embossed velvet suite box'
    ]
  },
  {
    id: 'sa-set-02',
    name: 'Lumière Everyday Duo (Hoops & Necklace)',
    category: 'Jewellery Sets',
    price: 10200,
    originalPrice: 11700,
    images: [
      '/src/assets/images/category_earrings_1794482389310.jpg',
      '/src/assets/images/category_necklaces_1794482386916.jpg',
    ],
    description: 'The effortless everyday pairing: our top-rated Hammered Silver Huggie Hoops bundled with the Serena Floating Zirconia Choker. A coordinated set that elevates workwear, casual linen, or formal dinners.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Triple Rhodium Anti-Tarnish',
    stone: 'AAA Zirconia + Polished Silver',
    weight: '8.7 grams combined',
    hallmark: '925 Stamped',
    sizes: ['Universal Fit (16" + 2" Necklace, 16mm Hoops)'],
    inStock: true,
    stockCount: 9,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.9,
    reviewCount: 26,
    careNotes: [
      'Ideal gift set with ribbon and handwritten calligraphed gift card'
    ]
  },
  {
    id: 'sa-set-03',
    name: 'Celeste Stacking Ring Trio',
    category: 'Jewellery Sets',
    price: 8900,
    originalPrice: 10500,
    images: [
      '/src/assets/images/category_rings_1794482387362.jpg',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Three complementary textured silver rings designed to nest together or scatter across three fingers: one micro-pavé band, one twist rope band, and one mirror dome band.',
    silverPurity: 'Solid 925 Sterling Silver',
    plating: 'Electroplated White Rhodium',
    stone: 'Micro-Grain Pavé Zirconia',
    weight: '6.8 grams combined',
    hallmark: '925 Laser Stamped on all bands',
    sizes: ['6', '7', '8'],
    inStock: true,
    stockCount: 7,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.9,
    reviewCount: 41,
    careNotes: [
      'Mix and match or wear together as a statement stack'
    ]
  }
];

export const CATEGORIES_DATA = [
  {
    name: 'Rings',
    tagline: 'Solitaires, Eternity Bands & Textured Signets',
    image: '/src/assets/images/category_rings_1794482387362.jpg',
    count: 4,
  },
  {
    name: 'Necklaces',
    tagline: 'Chokers, Chains & Statement Collars',
    image: '/src/assets/images/category_necklaces_1794482386916.jpg',
    count: 4,
  },
  {
    name: 'Earrings',
    tagline: 'Huggies, Drops & Hypoallergenic Studs',
    image: '/src/assets/images/category_earrings_1794482389310.jpg',
    count: 4,
  },
  {
    name: 'Bracelets',
    tagline: 'Tennis Links, Bangles & Snake Chains',
    image: 'https://images.unsplash.com/photo-1611591475152-47831c367285?auto=format&fit=crop&w=900&q=80',
    count: 3,
  },
  {
    name: 'Anklets',
    tagline: 'Satellite Beads & Chime Charms',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
    count: 2,
  },
  {
    name: 'Jewellery Sets',
    tagline: 'Curated Bridal Suites & Everyday Duos',
    image: '/src/assets/images/hero_silver_aura_1794482387330.jpg',
    count: 3,
  },
];
