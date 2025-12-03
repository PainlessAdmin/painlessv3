/**
 * PROGRESS BAR (React)
 *
 * Interactive progress bar with:
 * - Dynamic steps based on flow (furniture, office, home)
 * - Clickable steps (completed steps only)
 * - Scrollable on mobile with current step centered
 * - Uses DaisyUI theme colors
 */

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { CALCULATOR_STEPS } from '@/lib/core/calculator/config';
import { calculatorStore, applicableSteps, goToStep } from '@/lib/calculator-store';
import { cn } from '@/lib/utils';

interface ProgressBarReactProps {
  currentStep: number;
  className?: string;
}

// Default steps for SSR (full flow)
const DEFAULT_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const ProgressBarReact: React.FC<ProgressBarReactProps> = ({
  currentStep,
  className,
}) => {
  const state = useStore(calculatorStore);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLButtonElement>(null);

  // Use state to avoid hydration mismatch - start with default steps
  const [steps, setSteps] = useState<number[]>(DEFAULT_STEPS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Update steps after hydration when store is ready
  useEffect(() => {
    setIsHydrated(true);
    setSteps(applicableSteps.get());
  }, [state.propertySize, state.serviceType]);

  const totalSteps = steps.length;

  // Find current position in the flow
  const currentIndex = steps.indexOf(currentStep);
  const progress = currentIndex >= 0 ? Math.round(((currentIndex + 1) / totalSteps) * 100) : 0;

  // Get step config for each applicable step
  const displaySteps = steps.map((stepNum, index) => {
    const stepConfig = CALCULATOR_STEPS.find(s => s.order === stepNum);
    return {
      order: stepNum,
      displayOrder: index + 1,
      title: stepConfig?.title.en || `Step ${stepNum}`,
      id: stepConfig?.id || `step-${stepNum}`,
    };
  });

  // Scroll to center current step on mobile
  useEffect(() => {
    if (currentStepRef.current && scrollContainerRef.current && isHydrated) {
      const container = scrollContainerRef.current;
      const stepElement = currentStepRef.current;

      const containerWidth = container.offsetWidth;
      const stepLeft = stepElement.offsetLeft;
      const stepWidth = stepElement.offsetWidth;
      const scrollPosition = stepLeft - (containerWidth / 2) + (stepWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  }, [currentStep, isHydrated]);

  const handleStepClick = (stepOrder: number) => {
    const clickedIndex = steps.indexOf(stepOrder);
    if (clickedIndex < currentIndex && clickedIndex >= 0) {
      goToStep(stepOrder);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Progress text */}
      <div className="text-center mb-4">
        <span className="text-sm font-medium text-primary">
          Step {currentIndex + 1} of {totalSteps}
        </span>
      </div>

      {/* Linear progress bar - DaisyUI progress */}
      <progress
        className="progress progress-primary w-full h-2 mb-4"
        value={progress}
        max="100"
      />

      {/* Step indicators - scrollable on mobile */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-1 md:gap-2 min-w-max md:min-w-0 md:justify-between py-2">
          {displaySteps.map((step, index) => {
            const stepIndex = index;
            const isCompleted = stepIndex < currentIndex;
            const isCurrent = step.order === currentStep;
            const isFuture = stepIndex > currentIndex;
            const isClickable = isCompleted;

            return (
              <button
                key={step.id}
                ref={isCurrent ? currentStepRef : undefined}
                onClick={() => handleStepClick(step.order)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center min-w-[60px] md:min-w-0 md:flex-1 transition-all duration-200',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-default'
                )}
                aria-label={`${step.title} - Step ${step.displayOrder}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    'w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all duration-200',
                    isCompleted && 'bg-primary text-primary-content',
                    isCurrent && 'bg-primary text-primary-content ring-4 ring-primary/30 scale-110',
                    isFuture && 'bg-base-300 text-base-content/50',
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.displayOrder
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'text-[10px] md:text-xs mt-1.5 text-center whitespace-nowrap',
                    isCompleted && 'text-primary',
                    isCurrent && 'text-primary font-semibold',
                    isFuture && 'text-base-content/50'
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProgressBarReact;
