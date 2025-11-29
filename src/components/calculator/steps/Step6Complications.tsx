/**
 * STEP 6: COMPLICATING FACTORS
 *
 * Multi-select checkboxes for factors that affect pricing:
 * - Large/fragile items: ×1.07
 * - Stairs: ×1.07
 * - Restricted access: ×1.07
 * - Plants: +1 van, +1 mover
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setComplications,
  nextStep,
} from '@/lib/calculator-store';
import type { Complication } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    label: 'Large or fragile items',
    description: 'Piano, artwork, antiques, glass furniture, or delicate items',
    icon: '📦',
    impact: 'Extra care needed',
  },
  {
    id: 'stairs',
    label: 'Stairs without elevator',
    description: 'Multiple floors with no lift access at either property',
    icon: '🪜',
    impact: 'Additional time required',
  },
  {
    id: 'restrictedAccess',
    label: 'Limited or restricted access',
    description: 'Narrow streets, parking restrictions, or long carry distance',
    icon: '🚫',
    impact: 'May need permits or extra planning',
  },
  {
    id: 'plants',
    label: 'Large collection of plants (20+)',
    description: 'Plants need special handling and separate transport',
    icon: '🌿',
    impact: 'Additional van required',
  },
];

export function Step6Complications() {
  const state = useStore(calculatorStore);

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

  // Calculate impact preview
  const impactPreview = getImpactPreview(selected);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Do any of these apply to your move?
        </h2>
        <p className="text-muted-foreground mt-2">
          Select all that apply - this helps us prepare properly
        </p>
      </div>

      {/* Complication Options */}
      <div className="space-y-3">
        {complicationOptions.map((option) => (
          <ComplicationCard
            key={option.id}
            option={option}
            isSelected={selected.includes(option.id)}
            onToggle={() => handleToggle(option.id)}
          />
        ))}

        {/* None of these */}
        <Card
          className={cn(
            'p-4 cursor-pointer transition-all',
            'hover:border-primary/50',
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
          <div className="flex items-center gap-4">
            <Checkbox
              checked={noneSelected}
              onCheckedChange={handleNoneToggle}
              className="pointer-events-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="font-medium text-foreground">
                None of these apply
              </span>
            </div>
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

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
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
        'p-4 cursor-pointer transition-all',
        'hover:border-primary/50',
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
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          className="mt-1 pointer-events-none"
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{option.icon}</span>
            <span className="font-medium text-foreground">{option.label}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {option.description}
          </p>

          {/* Impact badge */}
          {isSelected && (
            <div className="mt-2">
              <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {option.impact}
              </span>
            </div>
          )}
        </div>
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
