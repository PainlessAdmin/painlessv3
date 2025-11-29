/**
 * STEP 6: COMPLICATING FACTORS
 *
 * Multi-select checkboxes for factors that affect pricing:
 * - Large/fragile items: ×1.07
 * - Stairs: ×1.07
 * - Restricted access: ×1.07
 * - Plants: +1 van, +1 mover
 *
 * Enhanced with image cards and improved styling.
 */

import { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setComplications,
  nextStep,
  prevStep,
} from '@/lib/calculator-store';
import type { Complication } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OptionCardGrid } from '@/components/calculator/option-card';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

// Complication options with enhanced details
const complicationOptions: Array<{
  id: Complication;
  label: string;
  description: string;
  icon: string;
  impact: string;
  color: string;
}> = [
  {
    id: 'largeFragile',
    label: 'Fragile Items',
    description: 'Piano, artwork, antiques',
    icon: '📦',
    impact: 'Extra care needed',
    color: 'bg-purple-500',
  },
  {
    id: 'stairs',
    label: 'Stairs',
    description: 'No lift access',
    icon: '🪜',
    impact: 'Additional time',
    color: 'bg-blue-500',
  },
  {
    id: 'restrictedAccess',
    label: 'Limited Access',
    description: 'Narrow streets, parking issues',
    icon: '🚫',
    impact: 'Extra planning',
    color: 'bg-red-500',
  },
  {
    id: 'plants',
    label: 'Many Plants',
    description: '20+ plants to transport',
    icon: '🌿',
    impact: 'Extra van needed',
    color: 'bg-green-500',
  },
];

export function Step6Complications() {
  const state = useStore(calculatorStore);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<Complication[]>(
    state.complications || []
  );
  const [noneSelected, setNoneSelected] = useState(
    state.complications?.length === 0
  );

  // Handle complication toggle
  const handleToggle = (id: Complication) => {
    setNoneSelected(false);

    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      }
      return [...prev, id];
    });
  };

  // Handle "None of these" toggle
  const handleNoneToggle = () => {
    if (noneSelected) {
      setNoneSelected(false);
    } else {
      setNoneSelected(true);
      setSelected([]);
    }
  };

  // Handle continue
  const handleContinue = () => {
    setComplications(selected);
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  // Calculate impact preview
  const impactPreview = getImpactPreview(selected);

  return (
    <div ref={containerRef} className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          Do any of these apply?
        </h1>
        <p className="text-muted-foreground mt-2">
          Select all that apply - this helps us prepare properly
        </p>
      </div>

      {/* Complication Options as Image Cards */}
      <OptionCardGrid columns={2}>
        {complicationOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <div key={option.id} className="option-card">
              <input
                type="checkbox"
                name={option.id}
                id={`complication-${option.id}`}
                checked={isSelected}
                onChange={() => handleToggle(option.id)}
                className="sr-only"
              />
              <label
                htmlFor={`complication-${option.id}`}
                className={cn(
                  'block cursor-pointer rounded-2xl transition-all duration-300',
                  'hover:shadow-lg border-2 border-transparent h-full overflow-hidden relative',
                  isSelected && 'shadow-xl border-primary'
                )}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
                    : '#e1e8f1',
                }}
              >
                {/* Icon area with colored background */}
                <div className={cn(
                  'w-full aspect-video flex items-center justify-center text-5xl',
                  option.color
                )}>
                  <span className="drop-shadow-lg">{option.icon}</span>
                </div>

                {/* Content */}
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg text-foreground">
                    {option.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>

                  {/* Impact badge - always visible when selected */}
                  {isSelected && (
                    <div className="mt-2">
                      <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {option.impact}
                      </span>
                    </div>
                  )}
                </div>

                {/* Checkmark */}
                <div
                  className={cn(
                    'option-card-checkmark',
                    isSelected && 'opacity-100 scale-100'
                  )}
                >
                  ✓
                </div>
              </label>
            </div>
          );
        })}
      </OptionCardGrid>

      {/* None of these - Special styled card */}
      <Card
        className={cn(
          'p-6 cursor-pointer transition-all duration-300',
          'hover:shadow-lg hover:border-emerald-400',
          'flex items-center justify-center gap-4',
          noneSelected && 'border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-500'
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
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors',
          noneSelected ? 'bg-emerald-500 text-white' : 'bg-gray-200'
        )}>
          {noneSelected ? '✓' : '✅'}
        </div>
        <div>
          <span className="font-semibold text-lg text-foreground">
            None of these apply
          </span>
          <p className="text-sm text-muted-foreground">
            My move is straightforward
          </p>
        </div>
      </Card>

      {/* Impact Preview */}
      {selected.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
            <span>⚡</span>
            How this affects your quote:
          </h3>
          <ul className="space-y-1 text-sm text-amber-800">
            {impactPreview.map((impact, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-amber-500">•</span>
                {impact}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Navigation */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue"
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
    c => c === 'largeFragile' || c === 'stairs' || c === 'restrictedAccess'
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
