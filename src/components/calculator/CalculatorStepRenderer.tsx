/**
 * CALCULATOR STEP RENDERER
 *
 * Renders the appropriate step component based on the step ID.
 * Uses React.lazy() for async loading - only loads current step initially,
 * then preloads next steps in background.
 */

import * as React from 'react';
import { useEffect, useLayoutEffect, useCallback, Suspense, lazy } from 'react';
import { initializeStore, goToStep, applicableSteps, calculatorStore } from '@/lib/calculator-store';
import { preloadGoogleMaps } from '@/lib/google-maps-loader';

// Lazy load step components for async loading
const Step1ServiceType = lazy(() => import('./steps/Step1ServiceType'));
const Step2PropertySize = lazy(() => import('./steps/Step2PropertySize'));
const Step3BelongingsSlider = lazy(() => import('./steps/Step3BelongingsSlider'));
const Step4Recommendation = lazy(() => import('./steps/Step4Recommendation'));
const Step5DateSelection = lazy(() => import('./steps/Step5DateSelection'));
const Step5bDatePicker = lazy(() => import('./steps/Step5bDatePicker'));
const Step6Complications = lazy(() => import('./steps/Step6Complications'));
const Step7PropertyChain = lazy(() => import('./steps/Step7PropertyChain'));
const Step8AddressSelection = lazy(() => import('./steps/Step8AddressSelection'));
const Step10ExtrasGateway = lazy(() => import('./steps/Step10ExtrasGateway'));
const Step10aPacking = lazy(() => import('./steps/Step10aPacking'));
const Step10bDisassembly = lazy(() => import('./steps/Step10bDisassembly'));
const Step10cCleaning = lazy(() => import('./steps/Step10cCleaning'));
const Step10dStorage = lazy(() => import('./steps/Step10dStorage'));
const Step11Contact = lazy(() => import('./steps/Step11Contact'));
const Step12Quote = lazy(() => import('./steps/Step12Quote'));

// Import functions for preloading
const stepImports: Record<string, () => Promise<unknown>> = {
  'step-01': () => import('./steps/Step1ServiceType'),
  'step-02': () => import('./steps/Step2PropertySize'),
  'step-03': () => import('./steps/Step3BelongingsSlider'),
  'step-04': () => import('./steps/Step4Recommendation'),
  'step-05': () => import('./steps/Step5DateSelection'),
  'step-5b': () => import('./steps/Step5bDatePicker'),
  'step-06': () => import('./steps/Step6Complications'),
  'step-07': () => import('./steps/Step7PropertyChain'),
  'step-08': () => import('./steps/Step8AddressSelection'),
  'step-09': () => import('./steps/Step8AddressSelection'),
  'step-10': () => import('./steps/Step10ExtrasGateway'),
  'step-10a': () => import('./steps/Step10aPacking'),
  'step-10b': () => import('./steps/Step10bDisassembly'),
  'step-10c': () => import('./steps/Step10cCleaning'),
  'step-10d': () => import('./steps/Step10dStorage'),
  'step-11': () => import('./steps/Step11Contact'),
  'step-12': () => import('./steps/Step12Quote'),
};

interface CalculatorStepRendererProps {
  stepId: string;
}

const stepComponents: Record<string, React.LazyExoticComponent<React.ComponentType<unknown>>> = {
  'step-01': Step1ServiceType,
  'step-02': Step2PropertySize,
  'step-03': Step3BelongingsSlider,
  'step-04': Step4Recommendation,
  'step-05': Step5DateSelection,
  'step-5b': Step5bDatePicker,
  'step-06': Step6Complications,
  'step-07': Step7PropertyChain,
  'step-08': Step8AddressSelection,
  'step-09': Step8AddressSelection, // Combined with step-08
  'step-10': Step10ExtrasGateway,
  'step-10a': Step10aPacking,
  'step-10b': Step10bDisassembly,
  'step-10c': Step10cCleaning,
  'step-10d': Step10dStorage,
  'step-11': Step11Contact,
  'step-12': Step12Quote,
};

// Loading skeleton component
function StepLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="text-center">
        <div className="h-8 w-64 mx-auto bg-muted rounded" />
        <div className="h-5 w-48 mx-auto bg-muted rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * Parse step number from stepId
 */
function parseStepNumber(stepId: string): number {
  if (stepId === 'step-10a') return 10.1;
  if (stepId === 'step-10b') return 10.2;
  if (stepId === 'step-10c') return 10.3;
  if (stepId === 'step-10d') return 10.4;
  return parseInt(stepId.replace('step-', ''), 10);
}

/**
 * Convert step number to step ID
 */
function stepNumberToId(stepNum: number): string {
  if (stepNum === 10.1) return 'step-10a';
  if (stepNum === 10.2) return 'step-10b';
  if (stepNum === 10.3) return 'step-10c';
  if (stepNum === 10.4) return 'step-10d';
  return `step-${Math.floor(stepNum).toString().padStart(2, '0')}`;
}

/**
 * Preload the next step in the background
 * Also preloads Google Maps after step 2 is loaded
 */
function preloadNextStep(currentStepId: string) {
  const stepNumber = parseStepNumber(currentStepId);
  const steps = applicableSteps.get();
  const currentIndex = steps.indexOf(stepNumber);

  if (currentIndex >= 0 && currentIndex < steps.length - 1) {
    const nextStepNum = steps[currentIndex + 1];
    const nextStepId = stepNumberToId(nextStepNum);

    // Preload the next step after a short delay
    setTimeout(() => {
      const preloadFn = stepImports[nextStepId];
      if (preloadFn) {
        preloadFn().catch(() => {
          // Silently ignore preload errors
        });
      }
    }, 100);
  }

  // Preload Google Maps after step 2 is loaded (needed for step 8)
  if (stepNumber === 2) {
    setTimeout(() => {
      preloadGoogleMaps();
    }, 500);
  }
}

export const CalculatorStepRenderer: React.FC<CalculatorStepRendererProps> = ({ stepId }) => {
  const stepNumber = parseStepNumber(stepId);
  const isValidStep = (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 12) ||
    (stepNumber >= 10.1 && stepNumber <= 10.4);

  // Sync step function - used for initial mount and bfcache restore
  const syncStep = useCallback(() => {
    initializeStore();
    if (isValidStep) {
      goToStep(stepNumber, false);
    }
  }, [stepNumber, isValidStep]);

  // Use useLayoutEffect to sync BEFORE render (prevents flash of wrong state)
  useLayoutEffect(() => {
    syncStep();
  }, [syncStep]);

  // Handle browser back/forward cache (bfcache)
  // When page is restored from bfcache, useEffect doesn't run again
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // persisted = true means page was restored from bfcache
      if (event.persisted) {
        syncStep();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [syncStep]);

  // Preload next step after current step is loaded
  useEffect(() => {
    preloadNextStep(stepId);
  }, [stepId]);

  const StepComponent = stepComponents[stepId];

  if (!StepComponent) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Step not found: {stepId}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<StepLoadingSkeleton />}>
      <StepComponent />
    </Suspense>
  );
};
