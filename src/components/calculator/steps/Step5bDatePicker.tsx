/**
 * STEP 5b: DATE PICKER
 *
 * Calendar for selecting move date after flexibility is chosen.
 * Only shown if user selected 'fixed' or 'flexible' in Step 5.
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setDate,
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Step5bDatePicker() {
  const state = useStore(calculatorStore);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    state.selectedDate ? new Date(state.selectedDate) : undefined
  );

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  // Get maximum date (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleContinue = () => {
    // Save to store
    setDate(
      state.dateFlexibility || 'flexible',
      selectedDate ? selectedDate.toISOString() : undefined
    );
    // Navigate to step 6 (Complications)
    if (typeof window !== 'undefined') {
      window.location.href = '/calculator/step-06';
    }
  };

  const handlePrevious = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/calculator/step-05';
    }
  };

  // Format selected date for display
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const isFixed = state.dateFlexibility === 'fixed';

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          {isFixed ? 'Select your moving date' : 'When would you prefer to move?'}
        </h2>
        {!isFixed && (
          <p className="text-muted-foreground mt-2">
            We'll try to accommodate this date or suggest alternatives
          </p>
        )}
      </div>

      {/* Calendar with side info */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
          {/* Calendar */}
          <div className="flex justify-center md:justify-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < minDate || date > maxDate}
              initialFocus
              className="rounded-md border"
            />
          </div>

          {/* Selected date display - beside calendar on desktop */}
          {selectedDate && (
            <div className="flex flex-col items-center md:items-start justify-center space-y-3 md:min-w-[200px] md:pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                <span>📅</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              {/* Non-binding notice */}
              <p className="text-sm text-muted-foreground text-center md:text-left">
                Don't worry, this isn't set in stone. It just helps us plan your move better.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Weekend note */}
      {selectedDate && (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) && (
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Weekend move:</strong> Saturdays are our busiest days - book early to secure your slot!
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={handlePrevious}
        onNext={handleContinue}
        canGoNext={!!selectedDate}
        nextLabel="Continue"
      />
    </div>
  );
}

export default Step5bDatePicker;
