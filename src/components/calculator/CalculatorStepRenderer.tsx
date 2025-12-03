/**
 * CALCULATOR STEP RENDERER
 *
 * Renders the appropriate step component based on the step ID.
 * Used by the Astro page to hydrate the correct React component.
 */

import * as React from 'react';
import { useEffect } from 'react';
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

export const CalculatorStepRenderer: React.FC<CalculatorStepRendererProps> = ({ stepId }) => {
  useEffect(() => {
    // Initialize store on mount
    initializeStore();

    // Sync URL step with store (without navigation to avoid loop)
    // Handle sub-steps like 10a, 10b, etc.
    let stepNumber: number;
    if (stepId === 'step-10a') stepNumber = 10.1;
    else if (stepId === 'step-10b') stepNumber = 10.2;
    else if (stepId === 'step-10c') stepNumber = 10.3;
    else if (stepId === 'step-10d') stepNumber = 10.4;
    else stepNumber = parseInt(stepId.replace('step-', ''), 10);

    const isValidStep = (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 12) ||
      (stepNumber >= 10.1 && stepNumber <= 10.4);

    if (isValidStep) {
      goToStep(stepNumber, false);
    }
  }, [stepId]);

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
