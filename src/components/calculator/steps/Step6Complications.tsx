/**
 * STEP 6: COMPLICATING FACTORS
 *
 * Multi-select checkboxes for factors that affect pricing:
 * - Large/fragile items: ×1.07
 * - Stairs: ×1.07
 * - Restricted access: ×1.07
 * - Attic items: ×1.07
 * - Plants: +1 van, +1 mover
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
import { Card } from '@/components/ui/card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { cn } from '@/lib/utils';

// Complication options with details
const complicationOptions: Array<{
  id: Complication;
  label: string;
  description: string;
  icon: string;
  impact: string;
}> = [
  {
    id: 'largeFragile',
    label: 'Large/fragile',
    description: 'Piano, artwork, antiques',
    icon: '📦',
    impact: 'Extra care',
  },
  {
    id: 'stairs',
    label: 'Stairs',
    description: 'No lift access',
    icon: '🪜',
    impact: 'Extra time',
  },
  {
    id: 'restrictedAccess',
    label: 'Access issues',
    description: 'Narrow streets, parking',
    icon: '🚫',
    impact: 'Extra planning',
  },
  {
    id: 'attic',
    label: 'Attic items',
    description: 'Items in loft/attic',
    icon: '🏠',
    impact: 'Extra time',
  },
  {
    id: 'plants',
    label: 'Plants (20+)',
    description: 'Large plant collection',
    icon: '🌿',
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
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Do any of these apply?
        </h2>
        <p className="text-muted-foreground mt-2">
          Select all that apply, or "None" if none apply
        </p>
      </div>

      {/* Complication Options - 2 cols mobile, 3 cols desktop */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {complicationOptions.map((option) => (
          <ComplicationCard
            key={option.id}
            option={option}
            isSelected={selected.includes(option.id)}
            onToggle={() => handleToggle(option.id)}
          />
        ))}

        {/* None of these - Last card */}
        <Card
          className={cn(
            'p-3 cursor-pointer transition-all',
            'hover:border-primary/50 hover:-translate-y-1',
            noneSelected && 'border-primary bg-primary/5 ring-2 ring-primary'
          )}
          onClick={handleNoneToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNoneToggle();
            }
          }}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <span className="text-3xl">✅</span>
            <h3 className="font-semibold text-sm text-foreground">
              None
            </h3>
            <p className="text-xs text-muted-foreground">
              No complications
            </p>
            {noneSelected && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                ✓
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Impact Preview */}
      {selected.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <h3 className="font-medium text-foreground text-sm mb-2">
            How this affects your quote:
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
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
        canGoNext={selected.length > 0 || noneSelected}
        nextLabel="Continue"
      />
    </div>
  );
}

// ===================
// SUB-COMPONENTS
// ===================

interface ComplicationCardProps {
  option: {
    id: Complication;
    label: string;
    description: string;
    icon: string;
    impact: string;
  };
  isSelected: boolean;
  onToggle: () => void;
}

function ComplicationCard({ option, isSelected, onToggle }: ComplicationCardProps) {
  return (
    <Card
      className={cn(
        'p-3 cursor-pointer transition-all',
        'hover:border-primary/50 hover:-translate-y-1',
        isSelected && 'border-primary bg-primary/5 ring-2 ring-primary'
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        {/* Icon */}
        <span className="text-3xl">{option.icon}</span>

        {/* Label */}
        <h3 className="font-semibold text-sm text-foreground">
          {option.label}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {option.description}
        </p>

        {/* Selected indicator */}
        {isSelected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
            ✓
          </span>
        )}

        {/* Impact badge */}
        {isSelected && (
          <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            {option.impact}
          </span>
        )}
      </div>
    </Card>
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
