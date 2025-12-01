/**
 * PROGRESS BAR (React)
 *
 * Interactive progress bar with:
 * - Clickable steps (completed steps only)
 * - Scrollable on mobile with current step centered
 * - Brand color #035349
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { CALCULATOR_STEPS } from '@/lib/core/calculator/config';
import { goToStep } from '@/lib/calculator-store';
import { cn } from '@/lib/utils';

interface ProgressBarReactProps {
  currentStep: number;
  className?: string;
}

const BRAND_COLOR = '#035349';

export const ProgressBarReact: React.FC<ProgressBarReactProps> = ({
  currentStep,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentStepRef = useRef<HTMLButtonElement>(null);
  const totalSteps = CALCULATOR_STEPS.length;
  const progress = Math.round((currentStep / totalSteps) * 100);

  // Scroll to center current step on mobile
  useEffect(() => {
    if (currentStepRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const stepElement = currentStepRef.current;

      // Calculate scroll position to center the current step
      const containerWidth = container.offsetWidth;
      const stepLeft = stepElement.offsetLeft;
      const stepWidth = stepElement.offsetWidth;
      const scrollPosition = stepLeft - (containerWidth / 2) + (stepWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  }, [currentStep]);

  const handleStepClick = (stepOrder: number) => {
    // Only allow clicking on completed steps (steps before current)
    if (stepOrder < currentStep) {
      goToStep(stepOrder);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Progress text */}
      <div className="text-center mb-4">
        <span
          className="text-sm font-medium"
          style={{ color: BRAND_COLOR }}
        >
          Step {currentStep} of {totalSteps} ({progress}%)
        </span>
      </div>

      {/* Linear progress bar */}
      <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: BRAND_COLOR,
          }}
        />
      </div>

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
          {CALCULATOR_STEPS.map((step) => {
            const isCompleted = step.order < currentStep;
            const isCurrent = step.order === currentStep;
            const isFuture = step.order > currentStep;
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
                aria-label={`${step.title.en} - Step ${step.order}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    'w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all duration-200',
                    isCurrent && 'ring-4 ring-opacity-30 scale-110',
                  )}
                  style={{
                    backgroundColor: isCompleted || isCurrent ? BRAND_COLOR : '#E5E7EB',
                    color: isCompleted || isCurrent ? 'white' : '#9CA3AF',
                    ringColor: isCurrent ? BRAND_COLOR : undefined,
                  }}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.order
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'text-[10px] md:text-xs mt-1.5 text-center whitespace-nowrap',
                    isCurrent && 'font-semibold',
                    isFuture && 'opacity-50'
                  )}
                  style={{
                    color: isCompleted || isCurrent ? BRAND_COLOR : '#6B7280',
                  }}
                >
                  {step.title.en}
                </span>

                {/* Progress line between steps (hidden on last step) */}
                {step.order < totalSteps && (
                  <div
                    className="hidden md:block absolute h-0.5 top-4 -right-1/2 w-full -z-10"
                    style={{
                      backgroundColor: step.order < currentStep ? BRAND_COLOR : '#E5E7EB',
                    }}
                  />
                )}
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
