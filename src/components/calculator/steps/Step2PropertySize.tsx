/**
 * STEP 2: PROPERTY SIZE SELECTION
 *
 * Branches:
 * - Home: 9 property size options
 * - Office: 3 office size options
 * - Furniture: Redirects to Step2FurnitureOnly
 */

import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setPropertySize,
  setOfficeSize,
  nextStep,
  goToStep,
} from '@/lib/calculator-store';
import type { PropertySize, OfficeSize } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
}> = [
  { value: 'furniture', label: 'Furniture Only', icon: '🪑', description: 'Just a few items' },
  { value: 'studio', label: 'Studio', icon: '🏠' },
  { value: '1bed', label: '1 Bedroom', icon: '🏠' },
  { value: '2bed', label: '2 Bedrooms', icon: '🏠' },
  { value: '3bed-small', label: '3 Bed (Small)', icon: '🏡', description: 'Typical 3-bed' },
  { value: '3bed-large', label: '3 Bed (Large)', icon: '🏡', description: 'Spacious 3-bed' },
  { value: '4bed', label: '4 Bedrooms', icon: '🏡' },
  { value: '5bed', label: '5 Bedrooms', icon: '🏘️' },
  { value: '5bed-plus', label: '5+ Bedrooms', icon: '🏰', description: 'Large estate' },
];

function HomePropertySelection() {
  const state = useStore(calculatorStore);
  const selectedSize = state.propertySize;

  const handleSelect = (size: PropertySize) => {
    setPropertySize(size);

    // Furniture Only → special flow (Step 2B)
    if (size === 'furniture') {
      // We'll handle this with a sub-step or separate component
      // For now, go to step 2.5 (furniture flow)
      nextStep(); // Goes to Step2FurnitureOnly
      return;
    }

    // Studio → skip belongings slider (fixed 250 cubes)
    if (size === 'studio') {
      nextStep(); // Skip to Step 4 (recommendation)
      goToStep(4);
      return;
    }

    // All others → belongings slider (Step 3)
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

      {/* Property Cards - Grid */}
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
}> = [
  {
    value: 'small',
    label: 'Small Office',
    description: '1-5 desks, minimal equipment',
    icon: '🏢',
  },
  {
    value: 'medium',
    label: 'Medium Office',
    description: '6-15 desks, standard equipment',
    icon: '🏢',
  },
  {
    value: 'large',
    label: 'Large Office',
    description: '16+ desks, server room, heavy equipment',
    icon: '🏢',
  },
];

function OfficeSelection() {
  const state = useStore(calculatorStore);
  const selectedSize = state.officeSize;

  const handleSelect = (size: OfficeSize) => {
    setOfficeSize(size);
    // Office skips belongings slider → go to Step 5 (Date)
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

      {/* Office Cards - Stack on mobile, row on desktop */}
      <div className="grid gap-4 sm:grid-cols-3">
        {officeOptions.map((option) => (
          <Card
            key={option.value}
            className={cn(
              'relative cursor-pointer p-6 transition-all duration-200',
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
              <div className="absolute top-3 right-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  ✓
                </span>
              </div>
            )}

            {/* Icon */}
            <div className="text-3xl mb-3">{option.icon}</div>

            {/* Label */}
            <h3 className="font-semibold text-foreground">
              {option.label}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mt-1">
              {option.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Note */}
      <p className="text-center text-sm text-muted-foreground">
        Need a larger office move? We'll call you to discuss details.
      </p>
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
    icon: string;
    description?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function PropertyCard({ option, isSelected, onSelect }: PropertyCardProps) {
  return (
    <Card
      className={cn(
        'relative cursor-pointer p-4 transition-all duration-200',
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
        {/* Icon */}
        <div className="text-2xl mb-2">{option.icon}</div>

        {/* Label */}
        <h3 className="font-medium text-sm text-foreground">
          {option.label}
        </h3>

        {/* Description (if any) */}
        {option.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {option.description}
          </p>
        )}
      </div>
    </Card>
  );
}

export default Step2PropertySize;
