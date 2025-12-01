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
import { Step6Complications } from './steps/Step6Complications';
import { Step7PropertyChain } from './steps/Step7PropertyChain';
import { Step8FromAddress } from './steps/Step8FromAddress';
import { Step9ToAddress } from './steps/Step9ToAddress';
import { Step10Extras } from './steps/Step10Extras';
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
  'step-06': Step6Complications,
  'step-07': Step7PropertyChain,
  'step-08': Step8FromAddress,
  'step-09': Step9ToAddress,
  'step-10': Step10Extras,
  'step-11': Step11Contact,
  'step-12': Step12Quote,
};

export const CalculatorStepRenderer: React.FC<CalculatorStepRendererProps> = ({ stepId }) => {
  useEffect(() => {
    // Initialize store on mount
    initializeStore();

    // Sync URL step with store
    const stepNumber = parseInt(stepId.replace('step-', ''), 10);
    if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 12) {
      goToStep(stepNumber);
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
