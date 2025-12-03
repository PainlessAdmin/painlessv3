/**
 * PAINLESS REMOVALS - CALCULATOR STORE
 *
 * Nanostores state management for multi-step form.
 * Persists to localStorage for save & continue.
 */

import { computed, map } from 'nanostores';
import {
  calculateQuote,
  getCubesForProperty,
  getResourcesFromCubes,
  getResourcesForFurnitureOnly,
  getCubesForOffice,
  type QuoteResult,
} from './calculator-logic';
import { CALCULATOR_CONFIG } from './calculator-config';
import type {
  PropertySize,
  OfficeSize,
  SliderPosition,
  Complication,
  PackingSize,
} from './calculator-config';

// ===================
// TYPES
// ===================

export type ServiceType = 'home' | 'office' | 'clearance';
export type DateFlexibility = 'fixed' | 'flexible' | 'unknown';

export interface FurnitureOnlyData {
  itemCount: number;
  needs2Person: boolean;
  over40kg: boolean;
  specialistItems: string[];
  otherSpecialistDescription?: string;
}

export interface AddressData {
  formatted: string;
  postcode: string;
  lat?: number;
  lng?: number;
}

export interface DistanceData {
  depotToFrom: number;
  fromToTo: number;
  toToDepot: number;
  driveTimeHours: number;
  customerDistance: number; // Just from → to (for display)
  customerDriveMinutes: number;
}

export interface ExtrasData {
  packing?: PackingSize;
  cleaningRooms?: number;
  storage?: keyof typeof CALCULATOR_CONFIG.storage;
  assembly: Array<{
    type: keyof typeof CALCULATOR_CONFIG.assembly;
    quantity: number;
  }>;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
}

export interface CalculatorState {
  // Meta
  currentStep: number;
  startedAt: string | null;
  lastUpdatedAt: string | null;

  // Step 1: Service Type
  serviceType: ServiceType | null;

  // Step 2: Property/Office/Furniture
  propertySize: PropertySize | null;
  officeSize: OfficeSize | null;
  furnitureOnly: FurnitureOnlyData | null;

  // Step 3: Belongings
  sliderPosition: SliderPosition;

  // Step 4: Manual Override
  useManualOverride: boolean;
  manualMen: number | null;
  manualVans: number | null;

  // Step 5: Date
  dateFlexibility: DateFlexibility | null;
  selectedDate: string | null; // ISO string

  // Step 6: Complications
  complications: Complication[] | null;

  // Step 7: Property Chain
  propertyChain: boolean | null;

  // Step 8-9: Addresses
  fromAddress: AddressData | null;
  toAddress: AddressData | null;
  distances: DistanceData | null;

  // Step 10: Extras
  extras: ExtrasData;

  // Step 11: Contact
  contact: ContactData;

  // Tracking
  gclid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  landingPage: string | null;
  sessionId: string | null;
}

// ===================
// INITIAL STATE
// ===================

const initialState: CalculatorState = {
  currentStep: 1,
  startedAt: null,
  lastUpdatedAt: null,

  serviceType: null,
  propertySize: null,
  officeSize: null,
  furnitureOnly: null,
  sliderPosition: 3, // Default: Average

  useManualOverride: false,
  manualMen: null,
  manualVans: null,

  dateFlexibility: null,
  selectedDate: null,

  complications: null,
  propertyChain: null,

  fromAddress: null,
  toAddress: null,
  distances: null,

  extras: {
    packing: undefined,
    cleaningRooms: undefined,
    storage: undefined,
    assembly: [],
  },

  contact: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gdprConsent: false,
    marketingConsent: false,
  },

  gclid: null,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  landingPage: null,
  sessionId: null,
};

// ===================
// STORE
// ===================

export const calculatorStore = map<CalculatorState>(initialState);

// ===================
// COMPUTED VALUES
// ===================

/**
 * Get the steps that apply to the current flow
 * Step 9 is now combined with Step 8 (addresses on one page)
 * Furniture/Single item flow skips: Plan (4), Access (6), Chain (7), Extras (10)
 * Office flow skips: Items (3)
 * Studio skips: Items (3)
 */
export const applicableSteps = computed(calculatorStore, (state): number[] => {
  const isFurniture = state.propertySize === 'furniture';
  const isOffice = state.serviceType === 'office';
  const isStudio = state.propertySize === 'studio';

  // Full flow: 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12 (step 9 combined with 8)
  // Furniture flow: 1, 2, 5, 8, 11, 12 (skip 3, 4, 6, 7, 9, 10)
  // Office flow: 1, 2, 5, 6, 7, 8, 10, 11, 12 (skip 3, 4, 9)
  // Studio flow: 1, 2, 4, 5, 6, 7, 8, 10, 11, 12 (skip 3, 9)

  if (isFurniture) {
    return [1, 2, 5, 8, 11, 12];
  }

  if (isOffice) {
    return [1, 2, 5, 6, 7, 8, 10, 11, 12];
  }

  if (isStudio) {
    return [1, 2, 4, 5, 6, 7, 8, 10, 11, 12];
  }

  // Full home flow
  return [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12];
});

/**
 * Current step progress percentage based on applicable steps
 */
export const progressPercent = computed(calculatorStore, (state) => {
  const steps = applicableSteps.get();
  const currentIndex = steps.indexOf(state.currentStep);
  if (currentIndex === -1) return 0;
  return Math.round(((currentIndex + 1) / steps.length) * 100);
});

/**
 * Progress message for current step
 */
export const progressMessage = computed(calculatorStore, (state) => {
  return CALCULATOR_CONFIG.progressMessages[state.currentStep] || '';
});

/**
 * Calculated cubes based on current selections
 */
export const calculatedCubes = computed(calculatorStore, (state) => {
  if (state.serviceType === 'office' && state.officeSize) {
    return getCubesForOffice(state.officeSize);
  }

  if (state.propertySize && state.propertySize !== 'furniture') {
    return getCubesForProperty(state.propertySize, state.sliderPosition);
  }

  return 0;
});

/**
 * Recommended resources based on cubes
 */
export const recommendedResources = computed(calculatorStore, (state) => {
  try {
    // Furniture only
    if (state.furnitureOnly) {
      const hasSpecialist = state.furnitureOnly.specialistItems.length > 0;
      return getResourcesForFurnitureOnly({
        itemCount: state.furnitureOnly.itemCount,
        needs2Person: state.furnitureOnly.needs2Person,
        over40kg: state.furnitureOnly.over40kg,
        hasSpecialist,
      });
    }

    // Office
    if (state.serviceType === 'office' && state.officeSize) {
      const cubes = getCubesForOffice(state.officeSize);
      return getResourcesFromCubes(cubes);
    }

    // Home - DEBUG
    console.log('recommendedResources check:', {
      propertySize: state.propertySize,
      sliderPosition: state.sliderPosition,
      condition: state.propertySize && state.propertySize !== 'furniture'
    });

    if (state.propertySize && state.propertySize !== 'furniture') {
      const cubes = getCubesForProperty(state.propertySize, state.sliderPosition);
      console.log('Calculated cubes:', cubes);
      const resources = getResourcesFromCubes(cubes);
      console.log('Calculated resources:', resources);
      return resources;
    }

    console.log('recommendedResources returning null - no conditions met');
    return null;
  } catch (e) {
    console.error('Resource calculation error:', e);
    return null;
  }
});

/**
 * Final resources (recommended or manual override)
 */
export const finalResources = computed(calculatorStore, (state) => {
  const recommended = recommendedResources.get();

  if (!recommended) return null;

  if (state.useManualOverride && state.manualMen && state.manualVans) {
    return {
      men: state.manualMen,
      vans: state.manualVans,
      loadTime: recommended.loadTime,
      requiresCallback: recommended.requiresCallback,
    };
  }

  return recommended;
});

/**
 * Whether callback is required
 */
export const requiresCallback = computed(calculatorStore, (state) => {
  // Specialist furniture items
  if (state.furnitureOnly?.specialistItems.length) {
    return { required: true, reason: 'specialist_items' };
  }

  // Large property (> 2000 cubes)
  const cubes = calculatedCubes.get();
  if (cubes > CALCULATOR_CONFIG.thresholds.callbackRequired) {
    return { required: true, reason: 'large_property' };
  }

  return { required: false };
});

/**
 * Full quote calculation
 */
export const quoteResult = computed(calculatorStore, (state): QuoteResult | null => {
  // Need minimum data
  if (!state.distances) return null;

  const resources = finalResources.get();
  if (!resources) return null;

  // Check for callback requirement
  const callback = requiresCallback.get();
  if (callback.required) return null;

  try {
    return calculateQuote({
      serviceType: state.serviceType || 'home',
      propertySize: state.propertySize || undefined,
      sliderPosition: state.sliderPosition,
      officeSize: state.officeSize || undefined,
      furnitureOnly: state.furnitureOnly ? {
        itemCount: state.furnitureOnly.itemCount,
        needs2Person: state.furnitureOnly.needs2Person,
        over40kg: state.furnitureOnly.over40kg,
        hasSpecialist: state.furnitureOnly.specialistItems.length > 0,
      } : undefined,
      complications: state.complications || [],
      propertyChain: state.propertyChain || false,
      distances: state.distances,
      extras: state.extras,
      manualOverride: state.useManualOverride && state.manualMen && state.manualVans
        ? { men: state.manualMen, vans: state.manualVans }
        : undefined,
    });
  } catch (e) {
    console.error('Quote calculation error:', e);
    return null;
  }
});

// ===================
// ACTIONS
// ===================

/**
 * Initialize store (call on mount)
 */
export function initializeStore() {
  const now = new Date().toISOString();

  // Try to restore from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('painless-calculator-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if not too old (7 days)
        const savedDate = new Date(parsed.lastUpdatedAt);
        const daysDiff = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff < 7) {
          calculatorStore.set({ ...parsed, lastUpdatedAt: now });
          return;
        }
      } catch (e) {
        console.error('Failed to restore state:', e);
      }
    }

    // Capture URL params
    const params = new URLSearchParams(window.location.search);
    calculatorStore.setKey('gclid', params.get('gclid'));
    calculatorStore.setKey('utmSource', params.get('utm_source'));
    calculatorStore.setKey('utmMedium', params.get('utm_medium'));
    calculatorStore.setKey('utmCampaign', params.get('utm_campaign'));
    calculatorStore.setKey('landingPage', window.location.pathname);
    calculatorStore.setKey('sessionId', crypto.randomUUID());
  }

  calculatorStore.setKey('startedAt', now);
  calculatorStore.setKey('lastUpdatedAt', now);
}

/**
 * Save state to localStorage
 */
export function saveState() {
  if (typeof window === 'undefined') return;

  const state = calculatorStore.get();
  calculatorStore.setKey('lastUpdatedAt', new Date().toISOString());

  localStorage.setItem('painless-calculator-state', JSON.stringify(state));
}

/**
 * Clear saved state
 */
export function clearState() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('painless-calculator-state');
  }
  calculatorStore.set(initialState);
}

/**
 * Navigate to a step URL
 */
function navigateToStep(step: number) {
  if (typeof window !== 'undefined') {
    const stepId = step.toString().padStart(2, '0');
    window.location.href = `/calculator/step-${stepId}`;
  }
}

/**
 * Go to next step in the flow (respects applicable steps)
 */
export function nextStep() {
  const current = calculatorStore.get().currentStep;
  const steps = applicableSteps.get();
  const currentIndex = steps.indexOf(current);

  if (currentIndex >= 0 && currentIndex < steps.length - 1) {
    const nextStepNum = steps[currentIndex + 1];
    calculatorStore.setKey('currentStep', nextStepNum);
    saveState();
    navigateToStep(nextStepNum);
  }
}

/**
 * Go to previous step in the flow (respects applicable steps)
 */
export function prevStep() {
  const current = calculatorStore.get().currentStep;
  const steps = applicableSteps.get();
  const currentIndex = steps.indexOf(current);

  if (currentIndex > 0) {
    const prevStepNum = steps[currentIndex - 1];
    calculatorStore.setKey('currentStep', prevStepNum);
    saveState();
    navigateToStep(prevStepNum);
  }
}

/**
 * Go to specific step
 */
export function goToStep(step: number, navigate: boolean = true) {
  if (step >= 1 && step <= 12) {
    calculatorStore.setKey('currentStep', step);
    saveState();
    if (navigate) {
      navigateToStep(step);
    }
  }
}

/**
 * Set service type (Step 1)
 */
export function setServiceType(type: ServiceType) {
  calculatorStore.setKey('serviceType', type);

  // Reset related fields when changing service type
  calculatorStore.setKey('propertySize', null);
  calculatorStore.setKey('officeSize', null);
  calculatorStore.setKey('furnitureOnly', null);

  saveState();
}

/**
 * Set property size (Step 2 - Home)
 */
export function setPropertySize(size: PropertySize) {
  calculatorStore.setKey('propertySize', size);
  saveState();
}

/**
 * Set office size (Step 2 - Office)
 */
export function setOfficeSize(size: OfficeSize) {
  calculatorStore.setKey('officeSize', size);
  saveState();
}

/**
 * Set furniture only data (Step 2 - Furniture)
 */
export function setFurnitureOnly(data: FurnitureOnlyData) {
  calculatorStore.setKey('furnitureOnly', data);
  saveState();
}

/**
 * Set slider position (Step 3)
 */
export function setSliderPosition(position: SliderPosition) {
  calculatorStore.setKey('sliderPosition', position);
  saveState();
}

/**
 * Set manual override (Step 4)
 */
export function setManualOverride(men: number, vans: number) {
  calculatorStore.setKey('useManualOverride', true);
  calculatorStore.setKey('manualMen', men);
  calculatorStore.setKey('manualVans', vans);
  saveState();
}

/**
 * Clear manual override (use recommendation)
 */
export function clearManualOverride() {
  calculatorStore.setKey('useManualOverride', false);
  calculatorStore.setKey('manualMen', null);
  calculatorStore.setKey('manualVans', null);
  saveState();
}

/**
 * Set date (Step 5)
 */
export function setDate(flexibility: DateFlexibility, date?: string) {
  calculatorStore.setKey('dateFlexibility', flexibility);
  calculatorStore.setKey('selectedDate', date || null);
  saveState();
}

/**
 * Set complications (Step 6)
 */
export function setComplications(complications: Complication[]) {
  calculatorStore.setKey('complications', complications);
  saveState();
}

/**
 * Toggle complication
 */
export function toggleComplication(complication: Complication) {
  const current = calculatorStore.get().complications || [];
  const index = current.indexOf(complication);

  if (index === -1) {
    calculatorStore.setKey('complications', [...current, complication]);
  } else {
    calculatorStore.setKey('complications', current.filter(c => c !== complication));
  }
  saveState();
}

/**
 * Set property chain (Step 7)
 */
export function setPropertyChain(isChain: boolean) {
  calculatorStore.setKey('propertyChain', isChain);
  saveState();
}

/**
 * Set from address (Step 8)
 */
export function setFromAddress(address: AddressData) {
  calculatorStore.setKey('fromAddress', address);
  saveState();
}

/**
 * Set to address (Step 9)
 */
export function setToAddress(address: AddressData) {
  calculatorStore.setKey('toAddress', address);
  saveState();
}

/**
 * Set distances (after both addresses are set)
 */
export function setDistances(distances: DistanceData) {
  calculatorStore.setKey('distances', distances);
  saveState();
}

/**
 * Set extras (Step 10)
 */
export function setExtras(extras: Partial<ExtrasData>) {
  const current = calculatorStore.get().extras;
  calculatorStore.setKey('extras', { ...current, ...extras });
  saveState();
}

/**
 * Add assembly item
 */
export function addAssemblyItem(type: keyof typeof CALCULATOR_CONFIG.assembly, quantity: number) {
  const current = calculatorStore.get().extras.assembly;
  const existing = current.findIndex(item => item.type === type);

  if (existing >= 0) {
    current[existing].quantity += quantity;
  } else {
    current.push({ type, quantity });
  }

  calculatorStore.setKey('extras', { ...calculatorStore.get().extras, assembly: [...current] });
  saveState();
}

/**
 * Remove assembly item
 */
export function removeAssemblyItem(type: keyof typeof CALCULATOR_CONFIG.assembly) {
  const current = calculatorStore.get().extras.assembly;
  calculatorStore.setKey('extras', {
    ...calculatorStore.get().extras,
    assembly: current.filter(item => item.type !== type),
  });
  saveState();
}

/**
 * Set contact info (Step 11)
 */
export function setContact(contact: Partial<ContactData>) {
  const current = calculatorStore.get().contact;
  calculatorStore.setKey('contact', { ...current, ...contact });
  saveState();
}

/**
 * Get state for API submission
 */
export function getSubmissionData() {
  const state = calculatorStore.get();
  const quote = quoteResult.get();

  return {
    // Form data
    serviceType: state.serviceType,
    propertySize: state.propertySize,
    officeSize: state.officeSize,
    furnitureOnly: state.furnitureOnly,
    sliderPosition: state.sliderPosition,
    complications: state.complications,
    propertyChain: state.propertyChain,
    fromAddress: state.fromAddress,
    toAddress: state.toAddress,
    distances: state.distances,
    dateFlexibility: state.dateFlexibility,
    selectedDate: state.selectedDate,
    extras: state.extras,
    contact: state.contact,

    // Quote data
    quote: quote ? {
      totalPrice: quote.totalPrice,
      men: quote.men,
      vans: quote.vans,
      cubes: quote.cubes,
      serviceDuration: quote.serviceDuration,
      breakdown: quote.breakdown,
    } : null,

    // Tracking
    gclid: state.gclid,
    utmSource: state.utmSource,
    utmMedium: state.utmMedium,
    utmCampaign: state.utmCampaign,
    landingPage: state.landingPage,
    sessionId: state.sessionId,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
  };
}
