/**
 * STEP 6: COMPLICATING FACTORS
 *
 * Multi-select checkboxes for factors that affect pricing:
 * - Large/fragile items: ×1.07
 * - Stairs: ×1.07
 * - Restricted access: ×1.07
 * - Attic items: ×1.07
 * - Plants: +1 van, +1 mover
 *
 * Uses DaisyUI cards with 1:1 images and microinteractions
 */

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setComplications,
  nextStep,
  prevStep,
} from '@/lib/calculator-store';
import type { Complication } from '@/lib/calculator-config';
import { SelectionCard, SimpleSelectionCard } from '@/components/ui/selection-card';
import { Card } from '@/components/ui/card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';

// Complication options with images
const complicationOptions: Array<{
  id: Complication;
  label: string;
  description: string;
  image: string;
  impact: string;
}> = [
  {
    id: 'largeFragile',
    label: 'Large/fragile',
    description: 'Piano, artwork, antiques',
    image: '/images/calculator/step6/large-fragile.svg',
    impact: 'Extra care',
  },
  {
    id: 'stairs',
    label: 'Stairs',
    description: 'No lift access',
    image: '/images/calculator/step6/stairs.svg',
    impact: 'Extra time',
  },
  {
    id: 'restrictedAccess',
    label: 'Access issues',
    description: 'Narrow streets, parking',
    image: '/images/calculator/step6/restricted-access.svg',
    impact: 'Extra planning',
  },
  {
    id: 'attic',
    label: 'Attic items',
    description: 'Items in loft/attic',
    image: '/images/calculator/step6/attic.svg',
    impact: 'Extra time',
  },
  {
    id: 'plants',
    label: 'Plants (20+)',
    description: 'Large plant collection',
    image: '/images/calculator/step6/plants.svg',
    impact: 'Extra van',
  },
];

export function Step6Complications() {
  const state = useStore(calculatorStore);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [selected, setSelected] = useState<Complication[]>(
    state.complications || []
  );
  // Only show "None" as selected if explicitly saved as empty array (not null/undefined)
  const [noneSelected, setNoneSelected] = useState(
    state.complications !== null && state.complications !== undefined && state.complications.length === 0
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Handle complication toggle
  const handleToggle = (id: Complication) => {
    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    setNoneSelected(false);

    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      return [...prev, id];
    });
  };

  // Handle "None of these" toggle with auto-next
  const handleNoneToggle = () => {
    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    if (noneSelected) {
      setNoneSelected(false);
    } else {
      setNoneSelected(true);
      setSelected([]);

      // Auto-next after selecting "None"
      navigationTimeoutRef.current = setTimeout(() => {
        navigationTimeoutRef.current = null;
        setComplications([]);
        nextStep();
      }, 300);
    }
  };

  // Handle continue
  const handleContinue = () => {
    setComplications(selected);
    nextStep();
  };

  // Calculate impact preview
  const impactPreview = getImpactPreview(selected);

  return (
    <div className="step-container">
      {/* Heading */}
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-semibold text-base-content">
          Do any of these apply?
        </h2>
        <p className="text-base-content/60 mt-2">
          Select all that apply
        </p>
      </div>

      {/* Complication Options - 2 cols mobile, 3 cols desktop */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {complicationOptions.map((option, index) => (
          <div
            key={option.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <SelectionCard
              value={option.id}
              label={option.label}
              description={option.description}
              imageSrc={option.image}
              isSelected={selected.includes(option.id)}
              onSelect={() => handleToggle(option.id)}
            />
            {/* Impact badge below card when selected */}
            {selected.includes(option.id) && (
              <div className="flex justify-center mt-1 animate-scale-in">
                <span className="badge badge-warning badge-sm">{option.impact}</span>
              </div>
            )}
          </div>
        ))}

        {/* None of these - Last card */}
        <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <SimpleSelectionCard
            label="None"
            description="No complications"
            icon={<span>✅</span>}
            isSelected={noneSelected}
            onSelect={handleNoneToggle}
          />
        </div>
      </div>

      {/* Impact Preview */}
      {selected.length > 0 && (
        <Card className="p-4 bg-base-200 animate-scale-in">
          <h3 className="font-medium text-base-content text-sm mb-2">
            How this affects your quote:
          </h3>
          <ul className="space-y-1 text-sm text-base-content/70">
            {impactPreview.map((impact, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-primary">•</span>
                {impact}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        nextLabel="Continue"
      />
    </div>
  );
}

// ===================
// HELPER FUNCTIONS
// ===================

function getImpactPreview(selected: Complication[]): string[] {
  const impacts: string[] = [];

  const percentageFactors = selected.filter(
    c => c === 'largeFragile' || c === 'stairs' || c === 'restrictedAccess' || c === 'attic'
  );

  if (percentageFactors.length > 0) {
    const totalMultiplier = Math.pow(1.07, percentageFactors.length);
    const percentIncrease = Math.round((totalMultiplier - 1) * 100);
    impacts.push(`+${percentIncrease}% for extra care and time`);
  }

  if (selected.includes('plants')) {
    impacts.push('Additional van and mover for plants');
  }

  return impacts;
}

export default Step6Complications;
