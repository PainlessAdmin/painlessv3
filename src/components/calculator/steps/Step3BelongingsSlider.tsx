/**
 * STEP 3: BELONGINGS SLIDER
 *
 * 5-position slider to estimate belongings volume.
 * Dynamic illustration + real-time resource preview.
 * Enhanced styling with better visual feedback.
 */

import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setSliderPosition,
  calculatedCubes,
  recommendedResources,
  nextStep,
  prevStep,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG } from '@/lib/calculator-config';
import type { SliderPosition } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

// Slider position details
const sliderDetails: Record<SliderPosition, {
  label: string;
  description: string;
  color: string;
  bgClass: string;
}> = {
  1: {
    label: 'Minimalist',
    description: 'Very few possessions, mostly empty rooms',
    color: 'text-emerald-600',
    bgClass: 'bg-emerald-500',
  },
  2: {
    label: 'Light',
    description: 'Essential furniture only, not much clutter',
    color: 'text-emerald-600',
    bgClass: 'bg-emerald-400',
  },
  3: {
    label: 'Average',
    description: 'Typical furnished home, normal amount of stuff',
    color: 'text-amber-600',
    bgClass: 'bg-amber-400',
  },
  4: {
    label: 'Full',
    description: 'Well-furnished with plenty of belongings',
    color: 'text-orange-600',
    bgClass: 'bg-orange-400',
  },
  5: {
    label: 'Packed',
    description: 'Every room is full, lots of items everywhere',
    color: 'text-red-600',
    bgClass: 'bg-red-500',
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

  const handleBack = () => {
    prevStep();
  };

  return (
    <div className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          How much stuff do you have?
        </h1>
        <p className="text-muted-foreground mt-2">
          Think about {propertyLabel} overall - we'll refine this later if needed
        </p>
      </div>

      {/* Visual Display Card */}
      <Card className="p-6 md:p-8 bg-white shadow-lg">
        <div className="text-center space-y-6">
          {/* Large Number Display */}
          <div className="relative">
            <div className={cn(
              'text-7xl md:text-8xl font-bold transition-colors duration-300',
              details.color
            )}>
              {position}
            </div>
            <div className="text-sm text-muted-foreground mt-1">out of 5</div>
          </div>

          {/* Current Label Badge */}
          <div>
            <span className={cn(
              'inline-flex items-center px-6 py-3 font-semibold rounded-full text-lg text-white transition-all duration-300',
              details.bgClass
            )}>
              {details.label}
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground max-w-md mx-auto">
            {details.description}
          </p>

          {/* Visual Box Illustration */}
          <div className="h-24 flex items-center justify-center">
            <IllustrationPlaceholder position={position} />
          </div>

          {/* Estimated Volume */}
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg py-2 px-4 inline-block">
            Estimated volume: <strong>~{cubes.toLocaleString()} cu ft</strong>
          </div>
        </div>
      </Card>

      {/* Enhanced Slider Control */}
      <div className="px-4 py-2">
        {/* Custom 5-position slider */}
        <div className="relative py-4">
          {/* Track Background */}
          <div className="h-3 bg-gray-200 rounded-full">
            {/* Filled portion with gradient */}
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                position === 1 && 'bg-emerald-500',
                position === 2 && 'bg-emerald-400',
                position === 3 && 'bg-amber-400',
                position === 4 && 'bg-orange-400',
                position === 5 && 'bg-red-500',
              )}
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
                  'relative w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-300 shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  'flex items-center justify-center font-bold',
                  pos <= position
                    ? cn(
                        'text-white',
                        pos === 1 && 'bg-emerald-500',
                        pos === 2 && 'bg-emerald-400',
                        pos === 3 && 'bg-amber-400',
                        pos === 4 && 'bg-orange-400',
                        pos === 5 && 'bg-red-500',
                      )
                    : 'bg-gray-300 text-gray-500',
                  pos === position && 'ring-4 ring-primary/30 scale-125 shadow-lg z-10'
                )}
                aria-label={sliderDetails[pos].label}
                aria-pressed={pos === position}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Labels below slider */}
        <div className="flex justify-between mt-6 text-xs md:text-sm text-muted-foreground">
          {([1, 2, 3, 4, 5] as SliderPosition[]).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => handlePositionChange(pos)}
              className={cn(
                'text-center transition-all duration-200 px-1 py-1',
                'hover:text-foreground',
                pos === position && cn('font-semibold', details.color)
              )}
            >
              {sliderDetails[pos].label}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Preview */}
      {resources && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-foreground font-medium">
              Based on this, you'll likely need:
            </div>
            <div className="flex items-center gap-6 text-sm font-semibold">
              <span className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <span className="text-xl">🚚</span>
                {resources.vans} van{resources.vans > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <span className="text-xl">👷</span>
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
// ILLUSTRATION COMPONENT
// ===================

interface IllustrationPlaceholderProps {
  position: SliderPosition;
}

function IllustrationPlaceholder({ position }: IllustrationPlaceholderProps) {
  // Visual representation using boxes
  const boxCounts: Record<SliderPosition, number> = {
    1: 2,
    2: 4,
    3: 6,
    4: 9,
    5: 12,
  };

  const boxColors: Record<SliderPosition, string> = {
    1: 'bg-emerald-300',
    2: 'bg-emerald-300',
    3: 'bg-amber-300',
    4: 'bg-orange-300',
    5: 'bg-red-300',
  };

  const count = boxCounts[position];
  const colorClass = boxColors[position];

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xs">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-lg transition-all duration-300 shadow-sm',
            // Vary sizes for visual interest
            i % 3 === 0 ? 'w-10 h-10' : i % 3 === 1 ? 'w-8 h-12' : 'w-12 h-8',
            colorClass
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
