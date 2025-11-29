/**
 * STEP 5: DATE SELECTION
 *
 * Options:
 * 1. Fixed date - completion day, must be this date
 * 2. Flexible date - preferred date but can adjust
 * 3. Unknown - don't know yet
 *
 * Shows date picker for fixed/flexible options.
 * Enhanced styling with image cards and improved UX.
 */

import { useState, useRef } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { OptionCardGrid } from '@/components/calculator/option-card';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

// Date flexibility options with enhanced styling
const flexibilityOptions: Array<{
  value: DateFlexibility;
  label: string;
  description: string;
  icon: string;
  showDatePicker: boolean;
  color: string;
}> = [
  {
    value: 'fixed',
    label: 'Fixed Date',
    description: 'Completion day, notice period ending',
    icon: '📅',
    showDatePicker: true,
    color: 'bg-blue-500',
  },
  {
    value: 'flexible',
    label: 'Flexible',
    description: 'Save with flexible dates',
    icon: '🗓️',
    showDatePicker: true,
    color: 'bg-emerald-500',
  },
  {
    value: 'unknown',
    label: 'Not Sure Yet',
    description: "We'll quote based on current rates",
    icon: '❓',
    showDatePicker: false,
    color: 'bg-amber-500',
  },
];

export function Step5DateSelection() {
  const state = useStore(calculatorStore);
  const containerRef = useRef<HTMLDivElement>(null);

  const [flexibility, setFlexibility] = useState<DateFlexibility | null>(
    state.dateFlexibility
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    state.selectedDate ? new Date(state.selectedDate) : undefined
  );
  const [showCalendar, setShowCalendar] = useState(
    state.dateFlexibility === 'fixed' || state.dateFlexibility === 'flexible'
  );

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
      // No date needed, auto-advance
      setShowCalendar(false);
      setSelectedDate(undefined);

      // Visual feedback animation
      containerRef.current?.classList.add('auto-next-animate');

      setTimeout(() => {
        containerRef.current?.classList.remove('auto-next-animate');
        setDate(option, undefined);
        nextStep();
      }, 200);
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

  const handleBack = () => {
    prevStep();
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

  // Check if weekend
  const isWeekend = selectedDate && (selectedDate.getDay() === 0 || selectedDate.getDay() === 6);

  return (
    <div ref={containerRef} className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          When do you need to move?
        </h1>
        <p className="text-muted-foreground mt-2">
          This helps us check availability and give you an accurate quote
        </p>
      </div>

      {/* Flexibility Options as Cards */}
      <OptionCardGrid columns={3}>
        {flexibilityOptions.map((option) => (
          <div key={option.value} className="option-card">
            <input
              type="radio"
              name="dateFlexibility"
              id={`date-${option.value}`}
              value={option.value}
              checked={flexibility === option.value}
              onChange={() => handleFlexibilitySelect(option.value)}
              className="sr-only"
            />
            <label
              htmlFor={`date-${option.value}`}
              className={cn(
                'block cursor-pointer rounded-2xl transition-all duration-300 p-6',
                'hover:shadow-lg border-2 border-transparent h-full',
                'flex flex-col items-center justify-center text-center gap-3',
                flexibility === option.value && 'shadow-xl border-primary bg-primary/5'
              )}
              style={{
                background: flexibility === option.value
                  ? 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
                  : '#e1e8f1',
              }}
            >
              {/* Icon with colored background */}
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white',
                option.color
              )}>
                {option.icon}
              </div>

              {/* Label */}
              <h3 className="font-semibold text-lg text-foreground">
                {option.label}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>

              {/* Selected Indicator */}
              {flexibility === option.value && (
                <div className="flex justify-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                    ✓
                  </span>
                </div>
              )}

              {/* Flexible savings badge */}
              {option.value === 'flexible' && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  Often saves money
                </span>
              )}
            </label>
          </div>
        ))}
      </OptionCardGrid>

      {/* Calendar */}
      {showCalendar && (
        <Card className="p-6 bg-white shadow-lg">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg text-foreground">
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
                className="rounded-xl border-2 shadow-sm"
              />
            </div>

            {/* Selected date display */}
            {selectedDate && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary rounded-full">
                  <span className="text-2xl">📅</span>
                  <span className="font-semibold text-lg">{formattedDate}</span>
                </div>
              </div>
            )}

            {/* Weekend note */}
            {isWeekend && (
              <Alert className="border-amber-400 bg-amber-50">
                <AlertDescription className="text-amber-800">
                  <strong>Weekend move:</strong> Saturdays are our busiest days - book early to secure your slot!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}

      {/* Unknown date info */}
      {flexibility === 'unknown' && (
        <Alert className="border-blue-300 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>No problem!</strong> We'll provide a quote based on current rates.
            Prices are valid for 30 days and may vary depending on your final date.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
        onContinue={handleContinue}
        continueDisabled={!canContinue}
        continueLabel="Continue"
      />
    </div>
  );
}

export default Step5DateSelection;
