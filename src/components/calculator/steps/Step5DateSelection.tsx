/**
 * STEP 5: DATE SELECTION
 *
 * Options:
 * 1. Fixed date - completion day, must be this date
 * 2. Flexible date - preferred date but can adjust
 * 3. Unknown - don't know yet
 *
 * Shows date picker for fixed/flexible options.
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setDate,
  nextStep,
  prevStep,
  type DateFlexibility,
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Date flexibility options
const flexibilityOptions: Array<{
  value: DateFlexibility;
  label: string;
  description: string;
  icon: string;
  showDatePicker: boolean;
}> = [
  {
    value: 'fixed',
    label: 'I have a fixed date',
    description: 'Completion day, notice period ending, etc.',
    icon: '📅',
    showDatePicker: true,
  },
  {
    value: 'flexible',
    label: "I have a date in mind, but I'm flexible",
    description: 'Flexible dates often mean better prices!',
    icon: '🗓️',
    showDatePicker: true,
  },
  {
    value: 'unknown',
    label: "I don't know the date yet",
    description: "We'll provide a quote you can use when ready",
    icon: '❓',
    showDatePicker: false,
  },
];

export function Step5DateSelection() {
  const state = useStore(calculatorStore);

  const [flexibility, setFlexibility] = useState<DateFlexibility | null>(
    state.dateFlexibility
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    state.selectedDate ? new Date(state.selectedDate) : undefined
  );
  const [showCalendar, setShowCalendar] = useState(false);

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  // Get maximum date (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const handleFlexibilitySelect = (option: DateFlexibility) => {
    setFlexibility(option);

    if (option === 'unknown') {
      // No date needed, can continue
      setShowCalendar(false);
      setSelectedDate(undefined);
    } else {
      // Show calendar for fixed/flexible
      setShowCalendar(true);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleContinue = () => {
    if (!flexibility) return;

    // Save to store
    setDate(
      flexibility,
      selectedDate ? selectedDate.toISOString() : undefined
    );

    nextStep();
  };

  // Can continue?
  const canContinue = flexibility === 'unknown' ||
    (flexibility && selectedDate);

  // Format selected date for display
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

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
              'p-4 cursor-pointer transition-all',
              'hover:border-primary/50 hover:-translate-y-1',
              flexibility === option.value && 'border-primary bg-primary/5 ring-2 ring-primary'
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
            <div className="flex flex-col items-center text-center space-y-3">
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

              {/* Selected indicator */}
              {flexibility === option.value && (
                <div className="flex justify-center">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    ✓
                  </span>
                </div>
              )}

              {/* Flexible date tip */}
              {option.value === 'flexible' && flexibility === 'flexible' && (
                <div className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Better prices!
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Calendar */}
      {showCalendar && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-foreground">
                {flexibility === 'fixed' ? 'Select your moving date' : 'Select your preferred date'}
              </h3>
              {flexibility === 'flexible' && (
                <p className="text-sm text-muted-foreground mt-1">
                  We'll try to accommodate this date or suggest alternatives
                </p>
              )}
            </div>

            {/* Calendar Component */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < minDate || date > maxDate}
                initialFocus
                className="rounded-md border"
              />
            </div>

            {/* Selected date display */}
            {selectedDate && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                  <span>📅</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
              </div>
            )}

            {/* Weekend note */}
            {selectedDate && (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) && (
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Weekend move:</strong> Saturdays are our busiest days - book early to secure your slot!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {/* Unknown date info */}
      {flexibility === 'unknown' && (
        <Alert>
          <AlertDescription>
            <strong>No problem!</strong> We'll provide a quote based on current rates.
            Prices are valid for 30 days and may vary depending on your final date.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        canGoNext={!!canContinue}
        nextLabel="Continue"
      />
    </div>
  );
}

export default Step5DateSelection;
