/**
 * STEP 3: BELONGINGS SLIDER
 *
 * 5-position slider to estimate belongings volume.
 * Dynamic illustration + real-time resource preview.
 */

import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setSliderPosition,
  calculatedCubes,
  recommendedResources,
  nextStep,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG } from '@/lib/calculator-config';
import type { SliderPosition } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Slider position details
const sliderDetails: Record<SliderPosition, {
  label: string;
  description: string;
  visual: string; // Emoji representation (replace with actual images)
}> = {
  1: {
    label: 'Minimalist',
    description: 'Very few possessions, mostly empty rooms',
    visual: '🪑',
  },
  2: {
    label: 'Light',
    description: 'Essential furniture only, not much clutter',
    visual: '🪑🛋️',
  },
  3: {
    label: 'Average',
    description: 'Typical furnished home, normal amount of stuff',
    visual: '🪑🛋️📦',
  },
  4: {
    label: 'Full',
    description: 'Well-furnished with plenty of belongings',
    visual: '🪑🛋️📦📦🗄️',
  },
  5: {
    label: 'Packed',
    description: 'Every room is full, lots of items everywhere',
    visual: '🪑🛋️📦📦📦🗄️📚',
  },
};

export function Step3BelongingsSlider() {
  const state = useStore(calculatorStore);
  const cubes = useStore(calculatedCubes);
  const resources = useStore(recommendedResources);

  const position = state.sliderPosition as SliderPosition;
  const details = sliderDetails[position];
  const propertyLabel = CALCULATOR_CONFIG.propertySizeOptions.find(
    p => p.value === state.propertySize
  )?.label || 'your property';

  const handlePositionChange = (newPosition: SliderPosition) => {
    setSliderPosition(newPosition);
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          How much stuff do you have?
        </h2>
        <p className="text-muted-foreground mt-2">
          Think about {propertyLabel} overall - we'll refine this later if needed
        </p>
      </div>

      {/* Visual Illustration Card */}
      <Card className="p-6 bg-gradient-to-b from-muted/30 to-muted/10">
        <div className="text-center space-y-4">
          {/* Dynamic Illustration */}
          <div className="h-32 flex items-center justify-center">
            <IllustrationPlaceholder position={position} />
          </div>

          {/* Current Label */}
          <div>
            <span className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-full text-lg">
              {details.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground">
            {details.description}
          </p>

          {/* Estimated Volume */}
          <p className="text-sm text-muted-foreground">
            Estimated volume: ~{cubes.toLocaleString()} cu ft
          </p>
        </div>
      </Card>

      {/* Slider Control */}
      <div className="px-2">
        {/* Custom 5-position slider */}
        <div className="relative">
          {/* Track */}
          <div className="h-2 bg-muted rounded-full">
            {/* Filled portion */}
            <div
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${((position - 1) / 4) * 100}%` }}
            />
          </div>

          {/* Clickable positions */}
          <div className="absolute inset-0 flex justify-between items-center">
            {([1, 2, 3, 4, 5] as SliderPosition[]).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => handlePositionChange(pos)}
                className={cn(
                  'relative w-6 h-6 rounded-full transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  pos <= position
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30',
                  pos === position && 'ring-4 ring-primary/30 scale-125'
                )}
                aria-label={sliderDetails[pos].label}
                aria-pressed={pos === position}
              >
                {pos === position && (
                  <span className="absolute inset-0 flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {pos}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Labels below slider */}
        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
          {([1, 2, 3, 4, 5] as SliderPosition[]).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => handlePositionChange(pos)}
              className={cn(
                'text-center transition-colors px-1',
                'hover:text-foreground',
                pos === position && 'text-primary font-medium'
              )}
            >
              {sliderDetails[pos].label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Preview */}
      {resources && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Based on this, you'll likely need:
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1">
                <span>🚚</span>
                {resources.vans} van{resources.vans > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <span>👷</span>
                {resources.men} mover{resources.men > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Helper text */}
      <p className="text-center text-sm text-muted-foreground">
        Not sure? "Average" works for most homes. You can adjust on the next screen.
      </p>

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
// ILLUSTRATION COMPONENT
// ===================

interface IllustrationPlaceholderProps {
  position: SliderPosition;
}

/**
 * Placeholder for dynamic illustration.
 *
 * TODO: Replace with actual images/3D renders:
 * - /images/belongings-1-minimalist.svg
 * - /images/belongings-2-light.svg
 * - /images/belongings-3-average.svg
 * - /images/belongings-4-full.svg
 * - /images/belongings-5-packed.svg
 */
function IllustrationPlaceholder({ position }: IllustrationPlaceholderProps) {
  // Visual representation using boxes
  const boxCounts: Record<SliderPosition, number> = {
    1: 2,
    2: 4,
    3: 6,
    4: 9,
    5: 12,
  };

  const count = boxCounts[position];

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xs">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded transition-all duration-300',
            // Vary sizes for visual interest
            i % 3 === 0 ? 'w-10 h-10' : i % 3 === 1 ? 'w-8 h-12' : 'w-12 h-8',
            // Color based on position
            position === 1 && 'bg-emerald-200',
            position === 2 && 'bg-emerald-300',
            position === 3 && 'bg-amber-300',
            position === 4 && 'bg-orange-300',
            position === 5 && 'bg-orange-400',
          )}
          style={{
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default Step3BelongingsSlider;
