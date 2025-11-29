/**
 * STEP 7: PROPERTY CHAIN
 *
 * Simple yes/no question with large image cards.
 * Property chain = minimum full day booking.
 * Auto-advances on selection.
 */

import { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setPropertyChain,
  nextStep,
  prevStep,
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { SimpleOptionCard } from '@/components/calculator/option-card';
import { StepNavigation } from '@/components/calculator/progress-bar-react';

export function Step7PropertyChain() {
  const state = useStore(calculatorStore);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isChain, setIsChain] = useState<boolean | null>(
    state.propertyChain
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (value: boolean) => {
    setIsChain(value);

    // Visual feedback animation
    containerRef.current?.classList.add('auto-next-animate');

    // Auto-advance after short delay
    setTimeout(() => {
      containerRef.current?.classList.remove('auto-next-animate');
      setPropertyChain(value);
      nextStep();
    }, 200);
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div ref={containerRef} className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          Are you part of a property chain?
        </h1>
        <p className="text-muted-foreground mt-2">
          This affects scheduling and availability
        </p>
      </div>

      {/* Large Yes/No Cards */}
      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
        {/* Yes Card */}
        <div className="option-card">
          <input
            type="radio"
            name="propertyChain"
            id="chain-yes"
            value="yes"
            checked={isChain === true}
            onChange={() => handleSelect(true)}
            className="sr-only"
          />
          <label
            htmlFor="chain-yes"
            className={cn(
              'block cursor-pointer rounded-2xl transition-all duration-300 p-8',
              'hover:shadow-lg border-2 border-transparent h-full',
              'flex flex-col items-center justify-center text-center gap-4',
              isChain === true && 'shadow-xl border-primary'
            )}
            style={{
              background: isChain === true
                ? 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
                : '#e1e8f1',
            }}
          >
            {/* Large Icon */}
            <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-4xl text-white shadow-lg">
              🔗
            </div>

            {/* Label */}
            <h3 className="font-bold text-xl text-foreground">
              Yes, I'm in a chain
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              Multiple completions on the same day - timing is critical
            </p>

            {/* Selected Indicator */}
            {isChain === true && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                ✓
              </span>
            )}
          </label>
        </div>

        {/* No Card */}
        <div className="option-card">
          <input
            type="radio"
            name="propertyChain"
            id="chain-no"
            value="no"
            checked={isChain === false}
            onChange={() => handleSelect(false)}
            className="sr-only"
          />
          <label
            htmlFor="chain-no"
            className={cn(
              'block cursor-pointer rounded-2xl transition-all duration-300 p-8',
              'hover:shadow-lg border-2 border-transparent h-full',
              'flex flex-col items-center justify-center text-center gap-4',
              isChain === false && 'shadow-xl border-primary'
            )}
            style={{
              background: isChain === false
                ? 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
                : '#e1e8f1',
            }}
          >
            {/* Large Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-4xl text-white shadow-lg">
              ✓
            </div>

            {/* Label */}
            <h3 className="font-bold text-xl text-foreground">
              No, independent move
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              No other transactions depend on my move
            </p>

            {/* Selected Indicator */}
            {isChain === false && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                ✓
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Chain info */}
      {isChain === true && (
        <Alert className="border-amber-400 bg-amber-50">
          <AlertDescription className="text-amber-800">
            <strong>Property chain moves</strong>
            <br />
            We'll reserve a full day for your move to ensure we can accommodate any delays in the chain. Our team is experienced with chain completions and will stay in close contact throughout the day.
          </AlertDescription>
        </Alert>
      )}

      {/* Not sure helper */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary underline transition-colors"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          What's a property chain?
        </button>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <Card className="p-5 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong className="text-blue-900">A property chain</strong> is when multiple house sales depend on each other. For example: you're buying a house from someone who is also buying another house on the same day. All transactions must complete together.
          </p>
          <p className="text-sm text-blue-800 mt-2">
            If any part of the chain is delayed, it affects everyone. That's why we reserve a full day for chain moves - to ensure flexibility if completion times shift.
          </p>
        </Card>
      )}

      {/* Navigation - only back button since auto-advance */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
      />
    </div>
  );
}

export default Step7PropertyChain;
