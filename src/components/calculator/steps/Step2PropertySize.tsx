/**
 * STEP 2: PROPERTY SIZE SELECTION
 *
 * Branches:
 * - Home: 9 property size options
 * - Office: 3 office size options
 * - Furniture: Shows Step2FurnitureOnly inline
 *
 * Uses DaisyUI cards with 1:1 images and microinteractions
 */

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setPropertySize,
  setOfficeSize,
  nextStep,
  prevStep,
  goToStep,
} from '@/lib/calculator-store';
import type { PropertySize, OfficeSize } from '@/lib/calculator-config';
import { SelectionCard } from '@/components/ui/selection-card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { Step2FurnitureOnly } from './Step2FurnitureOnly';

// ===================
// MAIN COMPONENT
// ===================

export function Step2PropertySize() {
  const state = useStore(calculatorStore);

  // Office branch
  if (state.serviceType === 'office') {
    return <OfficeSelection />;
  }

  // Furniture Only branch - show FurnitureOnly component if already selected
  if (state.propertySize === 'furniture') {
    return <Step2FurnitureOnly />;
  }

  // Home branch (default)
  return <HomePropertySelection />;
}

// ===================
// HOME PROPERTY SELECTION
// ===================

const propertyOptions: Array<{
  value: PropertySize;
  label: string;
  image: string;
  description?: string;
}> = [
  { value: 'furniture', label: 'Furniture Only', image: '/images/calculator/step2/furniture.svg', description: 'Just a few items' },
  { value: 'studio', label: 'Studio', image: '/images/calculator/step2/studio.svg' },
  { value: '1bed', label: '1 Bedroom', image: '/images/calculator/step2/1bed.svg' },
  { value: '2bed', label: '2 Bedrooms', image: '/images/calculator/step2/2bed.svg' },
  { value: '3bed-small', label: '3 Bed (Small)', image: '/images/calculator/step2/3bed-small.svg', description: 'Typical 3-bed' },
  { value: '3bed-large', label: '3 Bed (Large)', image: '/images/calculator/step2/3bed-large.svg', description: 'Spacious 3-bed' },
  { value: '4bed', label: '4 Bedrooms', image: '/images/calculator/step2/4bed.svg' },
  { value: '5bed', label: '5 Bedrooms', image: '/images/calculator/step2/5bed.svg' },
  { value: '5bed-plus', label: '5+ Bedrooms', image: '/images/calculator/step2/5bed-plus.svg', description: 'Large estate' },
];

function HomePropertySelection() {
  const state = useStore(calculatorStore);
  const [selectedSize, setSelectedSizeLocal] = useState<PropertySize | null>(state.propertySize);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (size: PropertySize) => {
    // Clear any pending navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    setSelectedSizeLocal(size);
    setPropertySize(size);

    // Furniture Only → show the FurnitureOnly form (no navigation, just re-render)
    if (size === 'furniture') {
      // The component will re-render and show Step2FurnitureOnly
      return;
    }

    // Auto-next after selection for other property types
    navigationTimeoutRef.current = setTimeout(() => {
      navigationTimeoutRef.current = null;

      // Studio → skip belongings slider (fixed 250 cubes)
      if (size === 'studio') {
        goToStep(4);
        return;
      }

      // All others → belongings slider (Step 3)
      nextStep();
    }, 300);
  };

  const handleNext = () => {
    if (!selectedSize) return;

    // Furniture Only - just set the property size, component will re-render
    if (selectedSize === 'furniture') {
      setPropertySize(selectedSize);
      return;
    }

    if (selectedSize === 'studio') {
      goToStep(4);
      return;
    }

    nextStep();
  };

  return (
    <div className="step-container">
      {/* Heading */}
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-semibold text-base-content">
          What size is your current home?
        </h2>
        <p className="text-base-content/60 mt-2">
          This helps us estimate what you'll need
        </p>
      </div>

      {/* Property Cards - Grid: 2 cols mobile, 3 cols desktop */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {propertyOptions.map((option, index) => (
          <div
            key={option.value}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <SelectionCard
              value={option.value}
              label={option.label}
              description={option.description}
              imageSrc={option.image}
              isSelected={selectedSize === option.value}
              onSelect={() => handleSelect(option.value)}
              className={option.value === 'furniture' ? 'border-dashed' : ''}
            />
          </div>
        ))}
      </div>

      {/* Help text */}
      <p className="text-center text-sm text-base-content/60 animate-fade-in">
        Not sure? Pick the closest match - you can adjust later.
      </p>

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleNext}
        canGoNext={!!selectedSize}
        nextLabel="Continue"
      />
    </div>
  );
}

// ===================
// OFFICE SELECTION
// ===================

const officeOptions: Array<{
  value: OfficeSize;
  label: string;
  description: string;
  image: string;
}> = [
  {
    value: 'small',
    label: 'Small Office',
    description: '1-5 desks, minimal equipment',
    image: '/images/calculator/step2/office-small.svg',
  },
  {
    value: 'medium',
    label: 'Medium Office',
    description: '6-15 desks, standard equipment',
    image: '/images/calculator/step2/office-medium.svg',
  },
  {
    value: 'large',
    label: 'Large Office',
    description: '16+ desks, server room, heavy equipment',
    image: '/images/calculator/step2/office-large.svg',
  },
];

function OfficeSelection() {
  const state = useStore(calculatorStore);
  const [selectedSize, setSelectedSizeLocal] = useState<OfficeSize | null>(state.officeSize);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (size: OfficeSize) => {
    // Clear any pending navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    setSelectedSizeLocal(size);
    setOfficeSize(size);

    // Auto-next after selection
    navigationTimeoutRef.current = setTimeout(() => {
      navigationTimeoutRef.current = null;
      goToStep(5);
    }, 300);
  };

  const handleNext = () => {
    if (!selectedSize) return;
    goToStep(5);
  };

  return (
    <div className="step-container">
      {/* Heading */}
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-semibold text-base-content">
          What size is your office?
        </h2>
        <p className="text-base-content/60 mt-2">
          We'll tailor our service to your business needs
        </p>
      </div>

      {/* Office Cards - 2 cols on mobile, 3 on desktop */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        {officeOptions.map((option, index) => (
          <div
            key={option.value}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <SelectionCard
              value={option.value}
              label={option.label}
              description={option.description}
              imageSrc={option.image}
              isSelected={selectedSize === option.value}
              onSelect={() => handleSelect(option.value)}
            />
          </div>
        ))}
      </div>

      {/* Note */}
      <p className="text-center text-sm text-base-content/60 animate-fade-in">
        Need a larger office move? We'll call you to discuss details.
      </p>

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleNext}
        canGoNext={!!selectedSize}
        nextLabel="Continue"
      />
    </div>
  );
}

export default Step2PropertySize;
