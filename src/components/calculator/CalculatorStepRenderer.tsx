/**
 * CALCULATOR STEP RENDERER
 *
 * Renders the appropriate step component based on the step ID.
 * Used by the Astro page to hydrate the correct React component.
 */

import * as React from 'react';
import { useEffect, useLayoutEffect, useCallback } from 'react';
import { initializeStore, goToStep } from '@/lib/calculator-store';

// Step components
import { Step1ServiceType } from './steps/Step1ServiceType';
import { Step2PropertySize } from './steps/Step2PropertySize';
import { Step3BelongingsSlider } from './steps/Step3BelongingsSlider';
import { Step4Recommendation } from './steps/Step4Recommendation';
import { Step5DateSelection } from './steps/Step5DateSelection';
import { Step5bDatePicker } from './steps/Step5bDatePicker';
import { Step6Complications } from './steps/Step6Complications';
import { Step7PropertyChain } from './steps/Step7PropertyChain';
import { Step8AddressSelection } from './steps/Step8AddressSelection';
import { Step10ExtrasGateway } from './steps/Step10ExtrasGateway';
import { Step10aPacking } from './steps/Step10aPacking';
import { Step10bDisassembly } from './steps/Step10bDisassembly';
import { Step10cCleaning } from './steps/Step10cCleaning';
import { Step10dStorage } from './steps/Step10dStorage';
import { Step11Contact } from './steps/Step11Contact';
import { Step12Quote } from './steps/Step12Quote';

interface CalculatorStepRendererProps {
  stepId: string;
}

const stepComponents: Record<string, React.ComponentType> = {
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

  const StepComponent = stepComponents[stepId];

  if (!StepComponent) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Step not found: {stepId}</p>
      </div>
    );
  }

  return <StepComponent />;
};
