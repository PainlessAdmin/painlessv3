/**
 * PAINLESS REMOVALS - CALCULATOR LOGIC
 *
 * All calculation functions for the quote calculator.
 * Uses data from calculator-config.ts
 */

import { CALCULATOR_CONFIG } from './calculator-config';
import type {
  PropertySize,
  OfficeSize,
  SliderPosition,
  Complication,
  PackingSize
} from './calculator-config';

// ===================
// TYPES
// ===================

export interface Resources {
  men: number;
  vans: number;
  loadTime: number;
}

export interface FurnitureOnlyInput {
  itemCount: number;
  needs2Person: boolean;
  over40kg: boolean;
  hasSpecialist: boolean;
}

export interface QuoteInput {
  // Service type
  serviceType: 'home' | 'office' | 'clearance';

  // Property (home)
  propertySize?: PropertySize;
  sliderPosition?: SliderPosition;

  // Furniture only
  furnitureOnly?: FurnitureOnlyInput;

  // Office
  officeSize?: OfficeSize;

  // Complications
  complications: Complication[];

  // Property chain
  propertyChain: boolean;

  // Distance (from Google Maps API)
  distances: {
    depotToFrom: number;  // miles
    fromToTo: number;     // miles
    toToDepot: number;    // miles
    driveTimeHours: number; // total drive time in hours
  };

  // Extra services
  extras: {
    packing?: PackingSize;
    cleaningRooms?: number;
    storage?: keyof typeof CALCULATOR_CONFIG.storage;
    assembly?: Array<{
      type: keyof typeof CALCULATOR_CONFIG.assembly;
      quantity: number;
    }>;
  };

  // Manual override (optional)
  manualOverride?: {
    men: number;
    vans: number;
  };
}

export interface QuoteResult {
  // Final price
  totalPrice: number;

  // Resources
  men: number;
  vans: number;
  cubes: number;

  // Time
  loadTime: number;
  totalJobTime: number;
  serviceDuration: string;
  serviceDays: number;
  isHalfDay: boolean;

  // Flags
  requiresCallback: boolean;
  callbackReason?: string;
  showMultiDayWarning: boolean;

  // Breakdown (for display)
  breakdown: {
    vansCost: number;
    moversCost: number;
    mileageCost: number;
    accommodationCost: number;
    extrasCost: number;
    complicationMultiplier: number;
    subtotal: number;
    margin: number;
  };
}

// ===================
// CORE FUNCTIONS
// ===================

/**
 * Get cubes for a property size and slider position
 */
export function getCubesForProperty(
  propertySize: PropertySize,
  sliderPosition: SliderPosition
): number {
  if (propertySize === 'furniture') {
    return 0; // Furniture only doesn't use cubes
  }

  const slider = CALCULATOR_CONFIG.sliderModifiers[sliderPosition];
  const propertyCubes = CALCULATOR_CONFIG.propertyCubes[propertySize];

  if (!propertyCubes) {
    throw new Error(`Unknown property size: ${propertySize}`);
  }

  const baseCubes = propertyCubes[slider.category];
  const finalCubes = Math.round(baseCubes * slider.modifier);

  return finalCubes;
}

/**
 * Get cubes for office size
 */
export function getCubesForOffice(officeSize: OfficeSize): number {
  return CALCULATOR_CONFIG.officeCubes[officeSize].cubes;
}

/**
 * Get resources (men, vans, loadTime) from cubes
 */
export function getResourcesFromCubes(cubes: number): Resources & { requiresCallback: boolean } {
  const { cubesTable, smallJobResources, extraCubesFormula } = CALCULATOR_CONFIG;

  // Small job (< 250 cubes)
  if (cubes < 250) {
    return { ...smallJobResources, requiresCallback: false };
  }

  // Find exact match or interpolate
  const cubeKeys = Object.keys(cubesTable).map(Number).sort((a, b) => a - b);

  // Exact match
  if (cubesTable[cubes]) {
    return { ...cubesTable[cubes], requiresCallback: false };
  }

  // Above maximum (> 2000)
  if (cubes > extraCubesFormula.baseCubes) {
    const extraCubes = cubes - extraCubesFormula.baseCubes;
    const men = extraCubesFormula.baseMen + Math.ceil(extraCubes / 250) * extraCubesFormula.menPer250;
    const vans = extraCubesFormula.baseVans + Math.ceil(extraCubes / 500) * extraCubesFormula.vansPer500;
    const loadTime = extraCubesFormula.baseLoadTime + (extraCubes / 250) * extraCubesFormula.loadTimePer250;

    return { men, vans, loadTime, requiresCallback: true };
  }

  // Find nearest lower key and use that
  let nearestKey = cubeKeys[0];
  for (const key of cubeKeys) {
    if (key <= cubes) {
      nearestKey = key;
    } else {
      break;
    }
  }

  return { ...cubesTable[nearestKey], requiresCallback: false };
}

/**
 * Get resources for furniture-only job
 */
export function getResourcesForFurnitureOnly(input: FurnitureOnlyInput): Resources & { requiresCallback: boolean } {
  const { loadTimeByItems } = CALCULATOR_CONFIG.furnitureOnly;

  // Specialist items = callback required
  if (input.hasSpecialist) {
    return { men: 0, vans: 0, loadTime: 0, requiresCallback: true };
  }

  // Find load time based on item count
  let loadTime = 2.5; // default for 10+
  const thresholds = Object.keys(loadTimeByItems).map(Number).sort((a, b) => a - b);

  for (const threshold of thresholds) {
    if (input.itemCount <= threshold) {
      loadTime = loadTimeByItems[threshold];
      break;
    }
  }

  // Determine men needed
  let men = 1;
  if (input.needs2Person || input.over40kg) {
    men = 2;
  }

  return { men, vans: 1, loadTime, requiresCallback: false };
}

// ===================
// PRICING FUNCTIONS
// ===================

/**
 * Calculate mover cost for a day
 */
export function getMoverDayCost(moverCount: number): number {
  const { firstTwo, additional } = CALCULATOR_CONFIG.moverRates;

  if (moverCount <= 0) return 0;
  if (moverCount <= 2) return moverCount * firstTwo;

  return (2 * firstTwo) + ((moverCount - 2) * additional);
}

/**
 * Calculate mileage cost (tiered)
 */
export function getMileageCost(totalMiles: number): number {
  const { mileageRates } = CALCULATOR_CONFIG;

  let cost = 0;
  let remainingMiles = totalMiles;
  let previousMax = 0;

  for (const tier of mileageRates) {
    const milesInTier = Math.min(remainingMiles, tier.maxMiles - previousMax);

    if (milesInTier > 0) {
      cost += milesInTier * tier.rate;
      remainingMiles -= milesInTier;
    }

    previousMax = tier.maxMiles;

    if (remainingMiles <= 0) break;
  }

  return cost;
}

/**
 * Calculate accommodation cost
 */
export function getAccommodationCost(crewCount: number, driveTimeHours: number): number {
  const { triggerHours, perRoom, peoplePerRoom } = CALCULATOR_CONFIG.accommodation;

  if (driveTimeHours <= triggerHours) {
    return 0;
  }

  const nights = Math.ceil(driveTimeHours / triggerHours) - 1;
  const rooms = Math.ceil(crewCount / peoplePerRoom);

  return rooms * perRoom * nights;
}

/**
 * Get service duration from total job time
 */
export function getServiceDuration(
  totalJobTime: number,
  propertyChain: boolean
): { days: number; isHalfDay: boolean; label: string } {
  const { halfDay, fullDay, twoDays, threeDays } = CALCULATOR_CONFIG.timeThresholds;

  // Property chain = minimum full day
  if (propertyChain && totalJobTime <= halfDay) {
    return { days: 1, isHalfDay: false, label: 'Full Day' };
  }

  if (totalJobTime <= halfDay) {
    return { days: 0.5, isHalfDay: true, label: 'Half Day' };
  }

  if (totalJobTime <= fullDay) {
    return { days: 1, isHalfDay: false, label: 'Full Day' };
  }

  if (totalJobTime <= twoDays) {
    return { days: 2, isHalfDay: false, label: '2 Days' };
  }

  if (totalJobTime <= threeDays) {
    return { days: 3, isHalfDay: false, label: '3 Days' };
  }

  const days = Math.ceil(totalJobTime / 12);
  return { days, isHalfDay: false, label: `${days} Days` };
}

/**
 * Apply complication factors
 */
export function applyComplications(
  resources: Resources,
  complications: Complication[]
): { resources: Resources; multiplier: number } {
  let multiplier = 1.0;
  let { men, vans, loadTime } = resources;

  for (const complication of complications) {
    const config = CALCULATOR_CONFIG.complications[complication];

    if ('factor' in config) {
      multiplier *= config.factor;
    }

    if ('addVans' in config) {
      vans += config.addVans;
    }

    if ('addMen' in config) {
      men += config.addMen;
    }
  }

  return {
    resources: { men, vans, loadTime },
    multiplier,
  };
}

/**
 * Get packing size category based on cubes
 */
function getPackingSizeCategory(cubes: number): 'small' | 'medium' | 'large' | 'xl' {
  if (cubes <= 500) return 'small';
  if (cubes <= 1000) return 'medium';
  if (cubes <= 1750) return 'large';
  return 'xl';
}

/**
 * Calculate extras cost (enhanced version with new pricing)
 */
export function getExtrasCost(extras: QuoteInput['extras'], cubes: number): number {
  let total = 0;

  // New packing tier system
  if ('packingTier' in extras && extras.packingTier) {
    const sizeCategory = getPackingSizeCategory(cubes);
    const tierConfig = CALCULATOR_CONFIG.packingTiers[extras.packingTier as keyof typeof CALCULATOR_CONFIG.packingTiers];
    if (tierConfig && tierConfig.priceBySize) {
      total += tierConfig.priceBySize[sizeCategory];
    }
  }
  // Legacy packing support
  else if (extras.packing) {
    total += CALCULATOR_CONFIG.packing[extras.packing].total;
  }

  // Enhanced cleaning with quick/deep options
  if ('cleaningRooms' in extras && extras.cleaningRooms && extras.cleaningRooms > 0) {
    const roomKey = Math.min(extras.cleaningRooms, 6) as 1 | 2 | 3 | 4 | 5 | 6;
    const basePrice = CALCULATOR_CONFIG.cleaning[roomKey].price;

    // Apply cleaning type multiplier if available
    const cleaningType = ('cleaningType' in extras ? extras.cleaningType : 'quick') as keyof typeof CALCULATOR_CONFIG.cleaningTiers;
    const multiplier = CALCULATOR_CONFIG.cleaningTiers[cleaningType]?.multiplier || 1.0;
    total += Math.round(basePrice * multiplier);
  }

  // Enhanced storage with duration
  if ('storageSize' in extras && extras.storageSize && 'storageWeeks' in extras && extras.storageWeeks) {
    const sizeConfig = CALCULATOR_CONFIG.storageSizes[extras.storageSize as keyof typeof CALCULATOR_CONFIG.storageSizes];
    if (sizeConfig) {
      const weeklyRate = sizeConfig.price;
      const weeks = extras.storageWeeks as number;

      // Apply 50% discount for first 2 months (8 weeks)
      const discountedWeeks = Math.min(weeks, 8);
      const fullPriceWeeks = Math.max(0, weeks - 8);
      const discountedCost = discountedWeeks * weeklyRate * 0.5;
      const fullPriceCost = fullPriceWeeks * weeklyRate;
      total += discountedCost + fullPriceCost;
    }
  }
  // Legacy storage support (monthly rate only)
  else if (extras.storage) {
    total += CALCULATOR_CONFIG.storage[extras.storage].price;
  }

  // Disassembly items (new structure)
  if ('disassemblyItems' in extras && extras.disassemblyItems && Array.isArray(extras.disassemblyItems)) {
    for (const item of extras.disassemblyItems as Array<{ category: keyof typeof CALCULATOR_CONFIG.assembly; quantity: number }>) {
      total += CALCULATOR_CONFIG.assembly[item.category].price * item.quantity;
    }
  }
  // Legacy assembly support
  else if (extras.assembly && extras.assembly.length > 0) {
    for (const item of extras.assembly) {
      total += CALCULATOR_CONFIG.assembly[item.type].price * item.quantity;
    }
  }

  return total;
}

/**
 * Get recommended packing size based on cubes
 */
export function getRecommendedPackingSize(cubes: number): PackingSize {
  const { packing } = CALCULATOR_CONFIG;

  if (cubes <= packing.small.cubesMax) return 'small';
  if (cubes <= packing.medium.cubesMax) return 'medium';
  if (cubes <= packing.large.cubesMax) return 'large';
  return 'xl';
}

/**
 * Apply profit margin
 */
export function applyMargin(baseCost: number): number {
  return baseCost / (1 - CALCULATOR_CONFIG.profitMargin);
}

/**
 * Round price to nearest £10
 */
export function roundPrice(price: number): number {
  return Math.round(price / 10) * 10;
}

// ===================
// MAIN CALCULATION
// ===================

/**
 * Calculate full quote
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  let cubes = 0;
  let resources: Resources;
  let requiresCallback = false;
  let callbackReason: string | undefined;

  // ===================
  // 1. GET RESOURCES
  // ===================

  if (input.serviceType === 'office' && input.officeSize) {
    // Office
    cubes = getCubesForOffice(input.officeSize);
    const result = getResourcesFromCubes(cubes);
    resources = result;
    requiresCallback = result.requiresCallback;

  } else if (input.furnitureOnly) {
    // Furniture only
    const result = getResourcesForFurnitureOnly(input.furnitureOnly);
    resources = result;
    requiresCallback = result.requiresCallback;
    if (requiresCallback) {
      callbackReason = 'specialist_items';
    }

  } else if (input.propertySize && input.sliderPosition) {
    // Home removal
    cubes = getCubesForProperty(input.propertySize, input.sliderPosition);
    const result = getResourcesFromCubes(cubes);
    resources = result;
    requiresCallback = result.requiresCallback;
    if (requiresCallback) {
      callbackReason = 'large_property';
    }

  } else {
    throw new Error('Invalid input: missing property size, office size, or furniture details');
  }

  // ===================
  // 2. APPLY MANUAL OVERRIDE
  // ===================

  if (input.manualOverride) {
    resources = {
      ...resources,
      men: input.manualOverride.men,
      vans: input.manualOverride.vans,
    };
  }

  // ===================
  // 3. APPLY COMPLICATIONS
  // ===================

  const complicationResult = applyComplications(resources, input.complications);
  resources = complicationResult.resources;
  const complicationMultiplier = complicationResult.multiplier;

  // ===================
  // 4. CALCULATE TIME
  // ===================

  const totalMiles = input.distances.depotToFrom + input.distances.fromToTo + input.distances.toToDepot;
  const totalJobTime = resources.loadTime + input.distances.driveTimeHours;

  const duration = getServiceDuration(totalJobTime, input.propertyChain);

  // ===================
  // 5. CALCULATE COSTS
  // ===================

  // Van cost
  const vanRate = duration.isHalfDay
    ? CALCULATOR_CONFIG.vanRates.halfDay
    : CALCULATOR_CONFIG.vanRates.fullDay;
  const vansCost = resources.vans * vanRate * (duration.isHalfDay ? 1 : duration.days);

  // Mover cost
  const moverDayRate = getMoverDayCost(resources.men);
  const moversCost = moverDayRate * (duration.isHalfDay ? 0.5 : duration.days);

  // Mileage cost
  const mileageCost = getMileageCost(totalMiles);

  // Accommodation cost
  const accommodationCost = getAccommodationCost(resources.men, input.distances.driveTimeHours);

  // Extras cost
  const extrasCost = getExtrasCost(input.extras, cubes);

  // ===================
  // 6. SUBTOTAL + COMPLICATIONS
  // ===================

  let subtotal = vansCost + moversCost + mileageCost + accommodationCost + extrasCost;
  subtotal *= complicationMultiplier;

  // ===================
  // 7. APPLY MARGIN
  // ===================

  const withMargin = applyMargin(subtotal);
  const totalPrice = roundPrice(withMargin);

  // ===================
  // 8. WARNINGS
  // ===================

  const showMultiDayWarning = totalJobTime > CALCULATOR_CONFIG.thresholds.multiDayWarning
    && totalJobTime <= 12;

  // ===================
  // 9. RETURN RESULT
  // ===================

  return {
    totalPrice,
    men: resources.men,
    vans: resources.vans,
    cubes,
    loadTime: resources.loadTime,
    totalJobTime,
    serviceDuration: duration.label,
    serviceDays: duration.days,
    isHalfDay: duration.isHalfDay,
    requiresCallback,
    callbackReason,
    showMultiDayWarning,
    breakdown: {
      vansCost,
      moversCost,
      mileageCost,
      accommodationCost,
      extrasCost,
      complicationMultiplier,
      subtotal,
      margin: totalPrice - subtotal,
    },
  };
}

// ===================
// VALIDATION
// ===================

/**
 * Validate van/crew combination
 */
export function validateVanCrew(
  vans: number,
  crew: number
): { valid: boolean; message?: string } {
  const { minVansPerCrew, maxCrewPerVan } = CALCULATOR_CONFIG.validation;

  const minCrew = vans * minVansPerCrew;
  const maxCrew = vans * maxCrewPerVan;

  if (crew < minCrew) {
    return {
      valid: false,
      message: `You need at least ${minCrew} mover${minCrew > 1 ? 's' : ''} for ${vans} van${vans > 1 ? 's' : ''} - each van needs a driver.`
    };
  }

  if (crew > maxCrew) {
    return {
      valid: false,
      message: `Maximum ${maxCrew} movers for ${vans} van${vans > 1 ? 's' : ''} - each van holds up to 3 people.`
    };
  }

  return { valid: true };
}

/**
 * Check if recommendation differs from manual selection
 */
export function checkRecommendationDiff(
  recommended: Resources,
  manual: { men: number; vans: number }
): { differs: boolean; message?: string } {
  if (recommended.men === manual.men && recommended.vans === manual.vans) {
    return { differs: false };
  }

  return {
    differs: true,
    message: `Based on your property, we'd typically recommend ${recommended.vans} van${recommended.vans > 1 ? 's' : ''} and ${recommended.men} mover${recommended.men > 1 ? 's' : ''}. You've selected ${manual.vans} van${manual.vans > 1 ? 's' : ''} and ${manual.men} mover${manual.men > 1 ? 's' : ''}.`,
  };
}
