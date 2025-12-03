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
  prevStep,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG } from '@/lib/calculator-config';
import type { SliderPosition } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
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

      {/* Main content - split layout, side by side on all screens */}
      <Card className="p-4 sm:p-6 bg-gradient-to-b from-muted/30 to-muted/10">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {/* Left side - Slider Info */}
          <div className="space-y-3">
            {/* Dynamic Illustration */}
            <div className="h-16 sm:h-24 flex items-center justify-center">
              <IllustrationPlaceholder position={position} />
            </div>

            {/* Current Label */}
            <div className="text-center">
              <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground font-semibold rounded-full text-sm sm:text-lg">
                {details.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              {details.description}
            </p>

            {/* Estimated Volume */}
            <p className="text-center text-xs text-muted-foreground">
              ~{cubes.toLocaleString()} cu ft
            </p>
          </div>

          {/* Right side - Resource Estimate */}
          {resources && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 text-center">Based on this, you'll need:</p>
              <div className="flex gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">🚚</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{resources.vans}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">van{resources.vans > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">👷</span>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{resources.men}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">mover{resources.men > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Slider Control */}
      <div className="px-2">
        {/* Draggable slider with 5 positions */}
        <div className="relative h-10">
          {/* Hidden range input for drag support */}
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={position}
            onChange={(e) => handlePositionChange(parseInt(e.target.value) as SliderPosition)}
            onInput={(e) => handlePositionChange(parseInt((e.target as HTMLInputElement).value) as SliderPosition)}
            className="absolute inset-0 w-full h-full cursor-pointer z-20"
            style={{
              opacity: 0,
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />

          {/* Track */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-muted rounded-full pointer-events-none">
            {/* Filled portion */}
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${((position - 1) / 4) * 100}%` }}
            />
          </div>

          {/* Position markers (visual only) */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none">
            {([1, 2, 3, 4, 5] as SliderPosition[]).map((pos) => (
              <div
                key={pos}
                className={cn(
                  'w-6 h-6 rounded-full transition-all duration-150',
                  pos <= position
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30',
                  pos === position && 'ring-4 ring-primary/30 scale-125'
                )}
              >
                {pos === position && (
                  <span className="flex items-center justify-center h-full text-primary-foreground text-xs font-bold">
                    {pos}
                  </span>
                )}
              </div>
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
