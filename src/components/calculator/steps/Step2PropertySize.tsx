/**
 * STEP 2: PROPERTY SIZE SELECTION
 *
 * Branches:
 * - Home: 9 property size options (image cards with auto-advance)
 * - Office: 3 office size options (image cards with auto-advance)
 * - Furniture: Redirects to Step2FurnitureOnly
 */

import { useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setPropertySize,
  setOfficeSize,
  nextStep,
  goToStep,
  prevStep,
} from '@/lib/calculator-store';
import type { PropertySize, OfficeSize } from '@/lib/calculator-config';
import { OptionCard, OptionCardGrid } from '@/components/calculator/option-card';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

// ===================
// MAIN COMPONENT
// ===================

export function Step2PropertySize() {
  const state = useStore(calculatorStore);

  // Office branch
  if (state.serviceType === 'office') {
    return <OfficeSelection />;
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
  icon: string;
  description?: string;
  placeholderClass: string;
}> = [
  { value: 'furniture', label: 'Furniture Only', icon: '🪑', description: 'Just a few items', placeholderClass: 'img-placeholder-extra' },
  { value: 'studio', label: 'Studio', icon: '🏠', placeholderClass: 'img-placeholder-property' },
  { value: '1bed', label: '1 Bedroom', icon: '🛏️', placeholderClass: 'img-placeholder-property' },
  { value: '2bed', label: '2 Bedrooms', icon: '🏠', placeholderClass: 'img-placeholder-property' },
  { value: '3bed-small', label: '3 Bed (Small)', icon: '🏡', description: 'Typical 3-bed', placeholderClass: 'img-placeholder-property' },
  { value: '3bed-large', label: '3 Bed (Large)', icon: '🏡', description: 'Spacious 3-bed', placeholderClass: 'img-placeholder-property' },
  { value: '4bed', label: '4 Bedrooms', icon: '🏡', placeholderClass: 'img-placeholder-property' },
  { value: '5bed', label: '5 Bedrooms', icon: '🏘️', placeholderClass: 'img-placeholder-property' },
  { value: '5bed-plus', label: '5+ Bedrooms', icon: '🏰', description: 'Large estate', placeholderClass: 'img-placeholder-property' },
];

function HomePropertySelection() {
  const state = useStore(calculatorStore);
  const selectedSize = state.propertySize;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (size: PropertySize) => {
    setPropertySize(size);

    // Visual feedback animation
    containerRef.current?.classList.add('auto-next-animate');

    // Auto-advance after short delay
    setTimeout(() => {
      containerRef.current?.classList.remove('auto-next-animate');

      // Furniture Only → special flow (Step 2B)
      if (size === 'furniture') {
        nextStep(); // Goes to Step2FurnitureOnly
        return;
      }

      // Studio → skip belongings slider (fixed 250 cubes)
      if (size === 'studio') {
        goToStep(4);
        return;
      }

      // All others → belongings slider (Step 3)
      nextStep();
    }, 200);
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div ref={containerRef} className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          What size is your current home?
        </h1>
        <p className="text-muted-foreground mt-2">
          This helps us estimate what you'll need
        </p>
      </div>

      {/* Property Cards Grid */}
      <OptionCardGrid columns={3}>
        {propertyOptions.map((option) => (
          <OptionCard
            key={option.value}
            id={option.value}
            name="propertySize"
            label={option.label}
            isSelected={selectedSize === option.value}
            onSelect={() => handleSelect(option.value)}
            icon={option.icon}
            placeholderClass={option.placeholderClass}
          />
        ))}
      </OptionCardGrid>

      {/* Help text */}
      <p className="text-center text-sm text-muted-foreground">
        Not sure? Pick the closest match - you can adjust later.
      </p>

      {/* Navigation */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
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
  icon: string;
  placeholderClass: string;
}> = [
  {
    value: 'small',
    label: 'Small Office',
    description: '1-5 desks, minimal equipment',
    icon: '🏢',
    placeholderClass: 'img-placeholder-office',
  },
  {
    value: 'medium',
    label: 'Medium Office',
    description: '6-15 desks, standard equipment',
    icon: '🏢',
    placeholderClass: 'img-placeholder-office',
  },
  {
    value: 'large',
    label: 'Large Office',
    description: '16+ desks, server room, heavy equipment',
    icon: '🏢',
    placeholderClass: 'img-placeholder-office',
  },
];

function OfficeSelection() {
  const state = useStore(calculatorStore);
  const selectedSize = state.officeSize;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (size: OfficeSize) => {
    setOfficeSize(size);

    // Visual feedback animation
    containerRef.current?.classList.add('auto-next-animate');

    // Auto-advance after short delay
    setTimeout(() => {
      containerRef.current?.classList.remove('auto-next-animate');
      // Office skips belongings slider → go to Step 5 (Date)
      goToStep(5);
    }, 200);
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div ref={containerRef} className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          What size is your office?
        </h1>
        <p className="text-muted-foreground mt-2">
          We'll tailor our service to your business needs
        </p>
      </div>

      {/* Office Cards Grid */}
      <OptionCardGrid columns={3}>
        {officeOptions.map((option) => (
          <OptionCard
            key={option.value}
            id={option.value}
            name="officeSize"
            label={option.label}
            isSelected={selectedSize === option.value}
            onSelect={() => handleSelect(option.value)}
            icon={option.icon}
            placeholderClass={option.placeholderClass}
          />
        ))}
      </OptionCardGrid>

      {/* Note */}
      <p className="text-center text-sm text-muted-foreground">
        Need a larger office move? We'll call you to discuss details.
      </p>

      {/* Navigation */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
      />
    </div>
  );
}

export default Step2PropertySize;
