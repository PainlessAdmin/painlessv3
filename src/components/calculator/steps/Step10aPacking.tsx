/**
 * STEP 10A: PACKING SERVICE
 *
 * Allow users to select their preferred level of packing assistance.
 * Options: Materials only, Fragile items, Full service
 * Pricing based on property size from the pricing matrix.
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  calculatedCubes,
  setPackingTier,
  nextStep,
  prevStep,
  type PackingTier,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG, type PackingSizeCategory } from '@/lib/calculator-config';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { cn } from '@/lib/utils';

// Get packing size category based on cubes
function getPackingSizeCategory(cubes: number): PackingSizeCategory {
  if (cubes <= 500) return 'small';
  if (cubes <= 1000) return 'medium';
  if (cubes <= 1750) return 'large';
  return 'xl';
}

// Format currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(price);
}

export function Step10aPacking() {
  const state = useStore(calculatorStore);
  const cubes = useStore(calculatedCubes);

  const [selectedTier, setSelectedTier] = useState<PackingTier | null>(
    state.extras.packingTier || null
  );

  // Get size category for pricing
  const sizeCategory = getPackingSizeCategory(cubes);

  // Sync with store on mount
  useEffect(() => {
    setSelectedTier(state.extras.packingTier || null);
  }, [state.extras.packingTier]);

  // Handle continue
  const handleContinue = () => {
    if (selectedTier) {
      setPackingTier(selectedTier);
    }
    nextStep();
  };

  // Check if selection is valid
  const isValid = selectedTier !== null;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          How much packing assistance do you need?
        </h2>
        <p className="text-muted-foreground mt-2">
          Save time and stress - let our professionals handle the packing
        </p>
      </div>

      {/* Upsell message */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Did you know?</span> Our customers who choose professional packing
          report <span className="text-primary font-semibold">80% less stress</span> and
          <span className="text-primary font-semibold"> 50% fewer breakages</span> on moving day.
        </p>
      </div>

      {/* Packing tier options */}
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.entries(CALCULATOR_CONFIG.packingTiers) as [PackingTier, typeof CALCULATOR_CONFIG.packingTiers.materials][]).map(
          ([tier, config]) => {
            const price = config.priceBySize[sizeCategory];
            const isSelected = selectedTier === tier;

            return (
              <PackingTierCard
                key={tier}
                tier={tier}
                label={config.label}
                description={config.description}
                price={price}
                includes={config.includes}
                badge={'badge' in config ? (config as { badge?: string }).badge : undefined}
                isSelected={isSelected}
                onSelect={() => setSelectedTier(tier)}
              />
            );
          }
        )}
      </div>

      {/* Note */}
      <p className="text-center text-sm text-muted-foreground">
        Prices shown are estimates based on your property size. Final pricing will be in your quote.
      </p>

      {/* Navigation */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        nextLabel="Continue"
        canGoNext={isValid}
      />
    </div>
  );
}

// Packing tier card component
interface PackingTierCardProps {
  tier: PackingTier;
  label: string;
  description: string;
  price: number;
  includes: readonly string[];
  badge?: string;
  isSelected: boolean;
  onSelect: () => void;
}

function PackingTierCard({
  label,
  description,
  price,
  includes,
  badge,
  isSelected,
  onSelect,
}: PackingTierCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-xl border-2 bg-card p-4',
        'transition-all duration-300 ease-out',
        'border-border shadow-sm',
        !isSelected && 'hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg',
        isSelected && [
          '-translate-y-1 scale-[1.02]',
          'border-primary bg-primary/5',
          'shadow-xl shadow-primary/10',
          'ring-2 ring-primary ring-offset-2 ring-offset-background',
        ],
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="radio"
      aria-checked={isSelected}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
          {badge}
        </div>
      )}

      {/* Selected indicator */}
      <div
        className={cn(
          'absolute -top-2 -right-2 z-10',
          'flex h-6 w-6 items-center justify-center rounded-full',
          'bg-primary text-primary-foreground text-xs font-bold shadow-md',
          'transition-all duration-300',
          isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className={cn(
            'font-semibold text-lg transition-colors',
            isSelected ? 'text-primary' : 'text-foreground'
          )}>
            {label}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        {/* Price */}
        <div className="text-center py-3 border-y border-border">
          <span className="text-3xl font-bold text-primary">{formatPrice(price)}</span>
        </div>

        {/* Includes list */}
        <ul className="space-y-2">
          {includes.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <svg
                className="h-4 w-4 text-primary shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Step10aPacking;
