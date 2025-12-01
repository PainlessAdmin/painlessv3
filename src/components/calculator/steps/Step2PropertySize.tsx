/**
 * STEP 2: PROPERTY SIZE SELECTION
 *
 * Branches:
 * - Home: 9 property size options
 * - Office: 3 office size options
 * - Furniture: Shows Step2FurnitureOnly inline
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
import { Card } from '@/components/ui/card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { cn } from '@/lib/utils';
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
  { value: 'furniture', label: 'Furniture Only', image: '/images/calculator/furniture-only.svg', description: 'Just a few items' },
  { value: 'studio', label: 'Studio', image: '/images/calculator/studio.svg' },
  { value: '1bed', label: '1 Bedroom', image: '/images/calculator/1bed.svg' },
  { value: '2bed', label: '2 Bedrooms', image: '/images/calculator/2bed.svg' },
  { value: '3bed-small', label: '3 Bed (Small)', image: '/images/calculator/3bed-small.svg', description: 'Typical 3-bed' },
  { value: '3bed-large', label: '3 Bed (Large)', image: '/images/calculator/3bed-large.svg', description: 'Spacious 3-bed' },
  { value: '4bed', label: '4 Bedrooms', image: '/images/calculator/4bed.svg' },
  { value: '5bed', label: '5 Bedrooms', image: '/images/calculator/5bed.svg' },
  { value: '5bed-plus', label: '5+ Bedrooms', image: '/images/calculator/5bed-plus.svg', description: 'Large estate' },
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
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          What size is your current home?
        </h2>
        <p className="text-muted-foreground mt-2">
          This helps us estimate what you'll need
        </p>
      </div>

      {/* Property Cards - Grid: 2 cols mobile, 3 cols desktop */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {propertyOptions.map((option) => (
          <PropertyCard
            key={option.value}
            option={option}
            isSelected={selectedSize === option.value}
            onSelect={() => handleSelect(option.value)}
          />
        ))}
      </div>

      {/* Help text */}
      <p className="text-center text-sm text-muted-foreground">
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
    image: '/images/calculator/office-small.svg',
  },
  {
    value: 'medium',
    label: 'Medium Office',
    description: '6-15 desks, standard equipment',
    image: '/images/calculator/office-medium.svg',
  },
  {
    value: 'large',
    label: 'Large Office',
    description: '16+ desks, server room, heavy equipment',
    image: '/images/calculator/office-large.svg',
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
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          What size is your office?
        </h2>
        <p className="text-muted-foreground mt-2">
          We'll tailor our service to your business needs
        </p>
      </div>

      {/* Office Cards - 2 cols on mobile, 3 on desktop */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        {officeOptions.map((option) => (
          <Card
            key={option.value}
            className={cn(
              'relative cursor-pointer p-4 transition-all duration-200',
              'hover:border-primary hover:-translate-y-1 hover:shadow-lg',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selectedSize === option.value && 'border-primary bg-primary/5 ring-2 ring-primary'
            )}
            onClick={() => handleSelect(option.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(option.value);
              }
            }}
            tabIndex={0}
            role="button"
            aria-pressed={selectedSize === option.value}
          >
            {/* Selected indicator */}
            {selectedSize === option.value && (
              <div className="absolute top-2 right-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                  ✓
                </span>
              </div>
            )}

            {/* Image */}
            <div className="flex justify-center mb-3">
              <img
                src={option.image}
                alt={option.label}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
            </div>

            {/* Label */}
            <h3 className="font-semibold text-sm text-foreground text-center">
              {option.label}
            </h3>

            {/* Description - hidden on mobile */}
            <p className="text-xs text-muted-foreground mt-1 text-center hidden sm:block">
              {option.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Note */}
      <p className="text-center text-sm text-muted-foreground">
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

// ===================
// PROPERTY CARD COMPONENT
// ===================

interface PropertyCardProps {
  option: {
    value: PropertySize;
    label: string;
    image: string;
    description?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function PropertyCard({ option, isSelected, onSelect }: PropertyCardProps) {
  return (
    <Card
      className={cn(
        'relative cursor-pointer p-3 transition-all duration-200',
        'hover:border-primary hover:-translate-y-1 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isSelected && 'border-primary bg-primary/5 ring-2 ring-primary',
        // Furniture Only gets slightly different styling
        option.value === 'furniture' && 'border-dashed'
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
            ✓
          </span>
        </div>
      )}

      {/* Content */}
      <div className="text-center">
        {/* Image */}
        <div className="flex justify-center mb-2">
          <img
            src={option.image}
            alt={option.label}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
          />
        </div>

        {/* Label */}
        <h3 className="font-medium text-xs sm:text-sm text-foreground">
          {option.label}
        </h3>

        {/* Description (if any) - hidden on mobile */}
        {option.description && (
          <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
            {option.description}
          </p>
        )}
      </div>
    </Card>
  );
}

export default Step2PropertySize;
