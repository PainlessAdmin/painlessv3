/**
 * CALCULATOR APP
 *
 * Main React component that renders the appropriate step
 * based on the calculator store's currentStep value.
 */

import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { calculatorStore, initializeStore } from '@/lib/calculator-store';

// Step components
import { Step1ServiceType } from './steps/Step1ServiceType';
import { Step2PropertySize } from './steps/Step2PropertySize';
import { Step2FurnitureOnly } from './steps/Step2FurnitureOnly';
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

export function CalculatorApp() {
  const state = useStore(calculatorStore);

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, []);

  // Render the appropriate step component
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1ServiceType />;
      case 2:
        // Show different Step 2 based on service type and property size
        if (state.propertySize === 'furniture') {
          return <Step2FurnitureOnly />;
        }
        return <Step2PropertySize />;
      case 3:
        return <Step3BelongingsSlider />;
      case 4:
        return <Step4Recommendation />;
      case 5:
        return <Step5DateSelection />;
      case 6:
        return <Step6Complications />;
      case 7:
        return <Step7PropertyChain />;
      case 8:
        return <Step8FromAddress />;
      case 9:
        return <Step9ToAddress />;
      case 10:
        return <Step10Extras />;
      case 11:
        return <Step11Contact />;
      case 12:
        return <Step12Quote />;
      default:
        return <Step1ServiceType />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {renderStep()}
    </div>
  );
}

export default CalculatorApp;
