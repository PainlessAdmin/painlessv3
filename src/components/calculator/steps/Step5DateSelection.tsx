/**
 * STEP 5: DATE FLEXIBILITY SELECTION
 *
 * Options:
 * 1. Fixed date - completion day, must be this date
 * 2. Flexible date - preferred date but can adjust
 * 3. Unknown - don't know yet
 *
 * If fixed/flexible selected, advances to Step 5b for date picker.
 */

import { useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setDate,
  nextStep,
  prevStep,
  type DateFlexibility,
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { cn } from '@/lib/utils';

// Date flexibility options
const flexibilityOptions: Array<{
  value: DateFlexibility;
  label: string;
  description: string;
  icon: string;
  needsDate: boolean;
  badge?: string;
}> = [
  {
    value: 'fixed',
    label: 'I have a fixed date',
    description: 'Completion day, notice period ending, etc.',
    icon: '📅',
    needsDate: true,
  },
  {
    value: 'flexible',
    label: "I'm flexible with dates",
    description: 'We can find the best available slot for you',
    icon: '🗓️',
    needsDate: true,
    badge: 'Better prices!',
  },
  {
    value: 'unknown',
    label: 'Just exploring options',
    description: "Get a quote to plan your budget",
    icon: '💭',
    needsDate: false,
  },
];

export function Step5DateSelection() {
  const state = useStore(calculatorStore);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleFlexibilitySelect = (option: DateFlexibility) => {
    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    const selectedOption = flexibilityOptions.find(o => o.value === option);

    // Auto-navigate after short delay
    navigationTimeoutRef.current = setTimeout(() => {
      navigationTimeoutRef.current = null;

      if (option === 'unknown') {
        // No date needed, save and go to next main step
        setDate('unknown', undefined);
        nextStep();
      } else {
        // Save flexibility and go to date picker step
        setDate(option, undefined);
        // Navigate to step 5b (calendar)
        if (typeof window !== 'undefined') {
          window.location.href = '/calculator/step-5b';
        }
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          When do you need to move?
        </h2>
        <p className="text-muted-foreground mt-2">
          This helps us check availability and give you an accurate quote
        </p>
      </div>

      {/* Flexibility Options - 3 columns on desktop */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {flexibilityOptions.map((option) => (
          <Card
            key={option.value}
            className={cn(
              'relative p-4 cursor-pointer transition-all',
              'hover:border-primary/50 hover:-translate-y-1',
              state.dateFlexibility === option.value && 'border-primary bg-primary/5 ring-2 ring-primary'
            )}
            onClick={() => handleFlexibilitySelect(option.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFlexibilitySelect(option.value);
              }
            }}
          >
            {/* Badge - always visible */}
            {option.badge && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                {option.badge}
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              {/* Icon */}
              <span className="text-4xl">{option.icon}</span>

              {/* Label */}
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {option.label}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        showNext={false}
      />
    </div>
  );
}

export default Step5DateSelection;
