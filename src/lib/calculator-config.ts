/**
 * PAINLESS REMOVALS - CALCULATOR CONFIGURATION
 *
 * All pricing tables, thresholds, and constants.
 * This file contains DATA ONLY - no calculation logic.
 */

export const CALCULATOR_CONFIG = {
  // Company info
  company: {
    name: 'Painless Removals Bristol',
    depot: 'BS10 5PN',
    phone: '0117 123 4567',
    email: 'quotes@painlessremovals.co.uk',
  },

  // Currency & formatting
  currency: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
  },

  // Profit margin (65%)
  profitMargin: 0.65,

  // ===================
  // CUBES → RESOURCES
  // ===================
  // Maps cubic feet to men, vans, and load time
  cubesTable: {
    250: { men: 2, vans: 1, loadTime: 1.5 },
    500: { men: 2, vans: 1, loadTime: 3 },
    750: { men: 3, vans: 2, loadTime: 4 },
    1000: { men: 4, vans: 2, loadTime: 5 },
    1250: { men: 5, vans: 3, loadTime: 6 },
    1500: { men: 6, vans: 3, loadTime: 7 },
    1750: { men: 7, vans: 4, loadTime: 7.5 },
    2000: { men: 8, vans: 4, loadTime: 8 },
  } as Record<number, { men: number; vans: number; loadTime: number }>,

  // For < 250 cubes (furniture only, small jobs)
  smallJobResources: { men: 1, vans: 1, loadTime: 1 },

  // Formula for > 2000 cubes (per 250 extra cubes)
  extraCubesFormula: {
    baseCubes: 2000,
    baseMen: 8,
    baseVans: 4,
    baseLoadTime: 8,
    menPer250: 1,      // +1 man per 250 cubes
    vansPer500: 1,     // +1 van per 500 cubes
    loadTimePer250: 1, // +1 hour per 250 cubes
  },

  // ===================
  // PROPERTY → CUBES
  // ===================
  propertyCubes: {
    'studio':     { few: 250, average: 250, many: 250 },
    '1bed':       { few: 250, average: 500, many: 750 },
    '2bed':       { few: 500, average: 750, many: 1000 },
    '3bed-small': { few: 750, average: 1000, many: 1250 },
    '3bed-large': { few: 1000, average: 1250, many: 1500 },
    '4bed':       { few: 1500, average: 1750, many: 2000 },
    '5bed':       { few: 1750, average: 2000, many: 2500 },
    '5bed-plus':  { few: 2500, average: 2500, many: 3000 },
  } as Record<string, { few: number; average: number; many: number }>,

  // ===================
  // SLIDER → MODIFIER
  // ===================
  // 5-position slider maps to category + modifier
  sliderModifiers: {
    1: { category: 'few', modifier: 0.9, label: 'Minimalist' },
    2: { category: 'few', modifier: 1.0, label: 'Light' },
    3: { category: 'average', modifier: 1.0, label: 'Average' },
    4: { category: 'many', modifier: 1.0, label: 'Full' },
    5: { category: 'many', modifier: 1.2, label: 'Packed' },
  } as Record<number, { category: 'few' | 'average' | 'many'; modifier: number; label: string }>,

  // ===================
  // OFFICE → CUBES
  // ===================
  officeCubes: {
    'small':  { cubes: 500, description: '1-5 desks' },
    'medium': { cubes: 1000, description: '6-15 desks' },
    'large':  { cubes: 1500, description: '16+ desks' },
  } as Record<string, { cubes: number; description: string }>,

  // ===================
  // FURNITURE ONLY
  // ===================
  furnitureOnly: {
    // Base load time by item count (1M 1V base)
    loadTimeByItems: {
      5: 1,    // 1-5 items = 1 hour
      7: 1.5,  // 6-7 items = 1.5 hours
      10: 2,   // 8-10 items = 2 hours
      999: 2.5 // 10+ items = 2.5 hours
    } as Record<number, number>,

    // Weight threshold for 2-man job
    heavyWeightThreshold: 40, // kg

    // Specialist items (require callback)
    specialistItems: [
      'piano',
      'safe',
      'gym-equipment',
      'hot-tub',
      'marble-stone',
      'other'
    ],
  },

  // ===================
  // PRICING - VANS
  // ===================
  vanRates: {
    halfDay: 50,  // £50 per van for ≤5h
    fullDay: 100, // £100 per van per day
  },

  // ===================
  // PRICING - MOVERS
  // ===================
  moverRates: {
    firstTwo: 150,    // £150 each for first 2 movers
    additional: 140,  // £140 each for 3rd mover onwards
  },

  // ===================
  // PRICING - MILEAGE
  // ===================
  mileageRates: [
    { maxMiles: 50, rate: 0.50 },
    { maxMiles: 100, rate: 0.40 },
    { maxMiles: 250, rate: 0.35 },
    { maxMiles: Infinity, rate: 0.30 },
  ],

  // ===================
  // PRICING - ACCOMMODATION
  // ===================
  accommodation: {
    triggerHours: 10,   // If drive time > 10h, need overnight
    perRoom: 140,       // £140 per room per night
    peoplePerRoom: 2,   // 2 people per room
  },

  // ===================
  // TIME THRESHOLDS
  // ===================
  timeThresholds: {
    halfDay: 5,      // 0-5h = half day
    fullDay: 12,     // 5-12h = 1 day
    twoDays: 24,     // 12-24h = 2 days
    threeDays: 36,   // 24-36h = 3 days
    // 36+ = ceil(hours/12) days
  },

  // ===================
  // COMPLICATIONS
  // ===================
  complications: {
    largeFragile: { factor: 1.07, label: 'Large or fragile items' },
    stairs: { factor: 1.07, label: 'Stairs without elevator' },
    restrictedAccess: { factor: 1.07, label: 'Limited/restricted access' },
    attic: { factor: 1.07, label: 'Items in attic' },
    plants: { addVans: 1, addMen: 1, label: 'Large collection of plants (20+)' },
  },

  // ===================
  // PACKING SERVICES
  // ===================
  packing: {
    fragileOnly: {
      cubesMin: 0,
      cubesMax: Infinity,
      work: 250,
      materials: 185,
      total: 435,
      label: 'Fragile items only'
    },
    small: {
      cubesMin: 0,
      cubesMax: 750,
      work: 280,
      materials: 120,
      total: 400,
      label: 'Small (up to 750 cu ft)'
    },
    medium: {
      cubesMin: 751,
      cubesMax: 1350,
      work: 420,
      materials: 160,
      total: 580,
      label: 'Medium (751-1350 cu ft)'
    },
    large: {
      cubesMin: 1351,
      cubesMax: 2000,
      work: 540,
      materials: 185,
      total: 725,
      label: 'Large (1351-2000 cu ft)'
    },
    xl: {
      cubesMin: 2001,
      cubesMax: Infinity,
      work: 720,
      materials: 270,
      total: 990,
      label: 'XL (2000+ cu ft)'
    },
  },

  // ===================
  // PACKING TIERS (NEW)
  // ===================
  // Three-tier packing system for extras gateway flow
  packingTiers: {
    materials: {
      label: 'Materials Only',
      description: 'Box and packing material rental only',
      image: 'moving-materials.jpg',
      // Pricing based on property size (cubes)
      priceBySize: {
        small: 85,    // Studio, 1-bed
        medium: 120,  // 2-bed, 3-bed small
        large: 165,   // 3-bed large, 4-bed
        xl: 220,      // 5-bed+
      },
      includes: [
        'Selection of moving boxes',
        'Bubble wrap & packing paper',
        'Tape & labels',
        'Wardrobe boxes',
      ],
    },
    fragile: {
      label: 'Fragile Items',
      description: 'Professional packing for fragile items only',
      image: 'home-packing.jpg',
      priceBySize: {
        small: 285,
        medium: 365,
        large: 435,
        xl: 520,
      },
      includes: [
        'Kitchen accessories & glassware',
        'Mirrors & artwork',
        'Electronics & TVs',
        'Premium packing materials',
      ],
    },
    fullService: {
      label: 'Full Service',
      description: 'Complete professional packing service',
      image: 'home-packing-service.jpg',
      badge: 'Most Popular',
      priceBySize: {
        small: 400,
        medium: 580,
        large: 725,
        xl: 990,
      },
      includes: [
        'Full home packing service',
        'All furniture protected',
        'Every item carefully wrapped',
        'Stress-free experience',
      ],
    },
  },

  // ===================
  // CLEANING TIERS (ENHANCED)
  // ===================
  cleaningTiers: {
    quick: {
      label: 'Quick Clean',
      description: 'Standard move-out cleaning',
      multiplier: 1.0,
    },
    deep: {
      label: 'Deep Clean',
      description: 'Thorough end-of-tenancy cleaning',
      multiplier: 1.6, // 60% more than quick
      badge: 'Recommended',
    },
  },

  // ===================
  // STORAGE DURATIONS
  // ===================
  storageDurations: [
    { value: 1, label: '1 week', weeks: 1 },
    { value: 4, label: '1 month', weeks: 4 },
    { value: 8, label: '2 months', weeks: 8, badge: '50% off first 2 months!' },
    { value: 12, label: '3 months', weeks: 12 },
    { value: 26, label: '6 months', weeks: 26 },
    { value: 52, label: '1 year', weeks: 52 },
    { value: 'other', label: "Other / I don't know", weeks: 4 }, // Default to 1 month
  ],

  // ===================
  // STORAGE SIZES (ENHANCED)
  // ===================
  storageSizes: {
    smallWardrobe: {
      price: 41,
      label: 'Small Wardrobe',
      sqft: 25,
      description: 'Perfect for a few boxes and small items',
      image: '25.png',
      fits: ['10-20 boxes', 'Small furniture items', 'Seasonal items'],
    },
    gardenShed: {
      price: 59,
      label: 'Garden Shed',
      sqft: 50,
      description: 'Great for studio or 1-bed contents',
      image: '50.png',
      fits: ['Small sofa', '30-40 boxes', 'Appliances'],
    },
    smallBedroom: {
      price: 82,
      label: 'Small Bedroom',
      sqft: 85,
      description: 'Ideal for 1-2 bedroom home contents',
      image: '85.png',
      fits: ['Bed frame & mattress', '50+ boxes', 'Living room furniture'],
    },
    standardBedroom: {
      price: 92,
      label: 'Standard Bedroom',
      sqft: 100,
      description: 'Most popular for 2-3 bed homes',
      image: '100.png',
      fits: ['2-3 rooms of furniture', 'Large sofa', 'Full bedroom suite'],
      badge: 'Most Popular',
    },
    largeBedroom: {
      price: 124,
      label: 'Large Bedroom',
      sqft: 150,
      description: 'Great for larger homes',
      image: '150.png',
      fits: ['3-4 rooms of furniture', 'Multiple beds', 'Dining sets'],
    },
    oneCarGarage: {
      price: 157,
      label: '1 Car Garage',
      sqft: 250,
      description: 'For complete house contents',
      image: '250.png',
      fits: ['4-5 bed house contents', 'Garden furniture', 'Workshop items'],
    },
  },

  // ===================
  // CLEANING SERVICES
  // ===================
  cleaning: {
    1: { price: 90, label: '1 room' },
    2: { price: 105, label: '2 rooms' },
    3: { price: 120, label: '3 rooms' },
    4: { price: 155, label: '4 rooms' },
    5: { price: 186, label: '5 rooms' },
    6: { price: 210, label: '6+ rooms' },
  } as Record<number, { price: number; label: string }>,

  // ===================
  // STORAGE SERVICES
  // ===================
  storage: {
    smallWardrobe: { price: 41, label: 'Small Wardrobe' },
    gardenShed: { price: 59, label: 'Garden Shed' },
    smallBedroom: { price: 82, label: 'Small Bedroom' },
    standardBedroom: { price: 92, label: 'Standard Bedroom' },
    largeBedroom: { price: 124, label: 'Large Bedroom' },
    oneCarGarage: { price: 157, label: 'One Car Garage' },
  },

  // ===================
  // FURNITURE ASSEMBLY
  // ===================
  assembly: {
    verySimple: { price: 20, label: 'Very Simple', examples: 'Tables, simple chairs' },
    simple: { price: 30, label: 'Simple', examples: 'Frame beds, bookshelves' },
    general: { price: 60, label: 'General', examples: 'Ottoman beds, double wardrobes' },
    complex: { price: 90, label: 'Complex', examples: 'Sliding door wardrobes' },
    veryComplex: { price: 120, label: 'Very Complex', examples: 'Gym equipment, custom' },
  },

  // ===================
  // PROPERTY SIZE OPTIONS
  // ===================
  // For UI display
  propertySizeOptions: [
    { value: 'furniture', label: 'Furniture Only', icon: '🪑' },
    { value: 'studio', label: 'Studio', icon: '🏠' },
    { value: '1bed', label: '1 Bedroom', icon: '🏠' },
    { value: '2bed', label: '2 Bedrooms', icon: '🏠' },
    { value: '3bed-small', label: '3 Bedrooms (Small)', icon: '🏡' },
    { value: '3bed-large', label: '3 Bedrooms (Large)', icon: '🏡' },
    { value: '4bed', label: '4 Bedrooms', icon: '🏡' },
    { value: '5bed', label: '5 Bedrooms', icon: '🏘️' },
    { value: '5bed-plus', label: '5+ Bedrooms', icon: '🏰' },
  ],

  // ===================
  // PROGRESS MESSAGES
  // ===================
  progressMessages: {
    1: "📦 Let's figure out what you need...",
    2: "📦 Let's figure out what you need...",
    3: "🏠 Great! Now let's plan the details...",
    4: "🏠 Great! Now let's plan the details...",
    5: "🎉 Halfway there! Just a few more details...",
    6: "🎉 Halfway there! Just a few more details...",
    7: "🚚 Almost done! We're mapping your route...",
    8: "🚚 Almost done! We're mapping your route...",
    9: "🚚 Almost done! We're mapping your route...",
    10: "🚀 Nearly there! Just your contact details...",
    11: "🚀 Nearly there! Just your contact details...",
    12: "🎉 Your quote is ready!",
  } as Record<number, string>,

  // ===================
  // VALIDATION
  // ===================
  validation: {
    minVansPerCrew: 1,     // Min 1 person per van (driver)
    maxCrewPerVan: 3,      // Max 3 people per van
    quoteValidDays: 30,    // Quote valid for 30 days
  },

  // ===================
  // THRESHOLDS
  // ===================
  thresholds: {
    callbackRequired: 2000,  // Cubes above which callback is recommended
    multiDayWarning: 8,      // Hours above which multi-day warning shown
  },

} as const;

// Type exports
export type PropertySize = keyof typeof CALCULATOR_CONFIG.propertyCubes | 'furniture';
export type OfficeSize = keyof typeof CALCULATOR_CONFIG.officeCubes;
export type BelongingsCategory = 'few' | 'average' | 'many';
export type SliderPosition = 1 | 2 | 3 | 4 | 5;
export type PackingSize = keyof typeof CALCULATOR_CONFIG.packing;
export type PackingTierType = keyof typeof CALCULATOR_CONFIG.packingTiers;
export type PackingSizeCategory = 'small' | 'medium' | 'large' | 'xl';
export type CleaningTierType = keyof typeof CALCULATOR_CONFIG.cleaningTiers;
export type StorageSize = keyof typeof CALCULATOR_CONFIG.storage;
export type StorageSizeKey = keyof typeof CALCULATOR_CONFIG.storageSizes;
export type AssemblyComplexity = keyof typeof CALCULATOR_CONFIG.assembly;
export type Complication = keyof typeof CALCULATOR_CONFIG.complications;
