/**
 * PROGRESS BAR (React)
 *
 * Clickable numbered circles for step navigation
 */

import * as React from 'react';
import { useStore } from '@nanostores/react';
import { calculatorStore, goToStep } from '@/lib/calculator-store';
import { cn } from '@/lib/utils';

interface ProgressBarReactProps {
  /** Total number of steps */
  totalSteps?: number;
  /** Current step (1-indexed) */
  currentStep?: number;
  /** Whether clicking on completed steps navigates back */
  allowNavigation?: boolean;
  /** Additional className */
  className?: string;
}

export const ProgressBarReact: React.FC<ProgressBarReactProps> = ({
  totalSteps = 12,
  currentStep: propCurrentStep,
  allowNavigation = true,
  className,
}) => {
  const state = useStore(calculatorStore);
  const currentStep = propCurrentStep ?? state.currentStep;

  const handleStepClick = (step: number) => {
    if (!allowNavigation) return;
    if (step < currentStep) {
      goToStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, step: number) => {
    if (!allowNavigation || step >= currentStep) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStepClick(step);
    }
  };

  return (
    <div className={cn('mb-8 md:mb-12 overflow-x-auto py-2', className)}>
      <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          const isFuture = step > currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div
                className={cn(
                  'progress-circle',
                  isActive && 'progress-circle-active',
                  isCompleted && 'progress-circle-completed',
                  isFuture && 'bg-gray-200 text-gray-400'
                )}
                onClick={() => isCompleted && handleStepClick(step)}
                onKeyDown={(e) => handleKeyDown(e, step)}
                role={isCompleted && allowNavigation ? 'button' : undefined}
                tabIndex={isCompleted && allowNavigation ? 0 : -1}
                aria-label={`Step ${step}${isCompleted ? ' (completed, click to go back)' : isActive ? ' (current)' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <span className="text-xs">✓</span>
                ) : (
                  step
                )}
              </div>

              {/* Connector Line */}
              {step < totalSteps && (
                <div
                  className={cn(
                    'w-4 md:w-6 h-0.5 transition-all duration-300',
                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * COMPACT PROGRESS BAR
 *
 * For mobile or minimal UI - shows current/total and progress line
 */
export const CompactProgressBar: React.FC<{
  currentStep: number;
  totalSteps?: number;
  className?: string;
}> = ({ currentStep, totalSteps = 12, className }) => {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={cn('mb-6', className)}>
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Counter */}
      <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{progress}% complete</span>
      </div>
    </div>
  );
};

/**
 * NAVIGATION BUTTONS
 *
 * Back + Continue buttons for step navigation
 */
export interface StepNavigationProps {
  /** Whether to show the back button */
  showBack?: boolean;
  /** Back button click handler */
  onBack?: () => void;
  /** Continue button click handler */
  onContinue?: () => void;
  /** Whether continue is disabled */
  continueDisabled?: boolean;
  /** Custom continue button label */
  continueLabel?: string;
  /** Whether showing loading state */
  isLoading?: boolean;
  /** Additional className */
  className?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  showBack = true,
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = 'Continue',
  isLoading = false,
  className,
}) => {
  return (
    <div className={cn('nav-buttons', className)}>
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary flex-1"
          disabled={isLoading}
        >
          ← Back
        </button>
      ) : (
        <div /> // Spacer
      )}

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="btn-primary flex-1"
          disabled={continueDisabled || isLoading}
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              Loading...
            </>
          ) : (
            continueLabel
          )}
        </button>
      )}
    </div>
  );
};

export default ProgressBarReact;
