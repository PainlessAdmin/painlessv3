/**
 * STEP 7: PROPERTY CHAIN
 *
 * Simple yes/no question.
 * Property chain = minimum full day booking.
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setPropertyChain,
  nextStep,
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export function Step7PropertyChain() {
  const state = useStore(calculatorStore);

  const [isChain, setIsChain] = useState<boolean | null>(
    state.propertyChain
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (value: boolean) => {
    setIsChain(value);
  };

  const handleContinue = () => {
    if (isChain === null) return;

    setPropertyChain(isChain);
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Are you part of a property chain?
        </h2>
        <p className="text-muted-foreground mt-2">
          This affects scheduling and availability
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Yes */}
        <Card
          className={cn(
            'p-6 cursor-pointer transition-all',
            'hover:border-primary/50 hover:-translate-y-1',
            isChain === true && 'border-primary bg-primary/5 ring-2 ring-primary'
          )}
          onClick={() => handleSelect(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect(true);
            }
          }}
        >
          <div className="text-center space-y-3">
            {/* Icon */}
            <div className="text-4xl">🔗</div>

            {/* Label */}
            <h3 className="font-semibold text-lg text-foreground">
              Yes, I'm in a chain
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              Multiple completions on the same day - timing is critical
            </p>

            {/* Selected indicator */}
            {isChain === true && (
              <div className="flex justify-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  ✓
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* No */}
        <Card
          className={cn(
            'p-6 cursor-pointer transition-all',
            'hover:border-primary/50 hover:-translate-y-1',
            isChain === false && 'border-primary bg-primary/5 ring-2 ring-primary'
          )}
          onClick={() => handleSelect(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect(false);
            }
          }}
        >
          <div className="text-center space-y-3">
            {/* Icon */}
            <div className="text-4xl">✓</div>

            {/* Label */}
            <h3 className="font-semibold text-lg text-foreground">
              No, my move is independent
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              No other transactions depend on my move
            </p>

            {/* Selected indicator */}
            {isChain === false && (
              <div className="flex justify-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                  ✓
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Chain info */}
      {isChain === true && (
        <Alert>
          <AlertDescription>
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
          className="text-sm text-muted-foreground hover:text-foreground underline"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          What's a property chain?
        </button>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">A property chain</strong> is when multiple house sales depend on each other. For example: you're buying a house from someone who is also buying another house on the same day. All transactions must complete together.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            If any part of the chain is delayed, it affects everyone. That's why we reserve a full day for chain moves - to ensure flexibility if completion times shift.
          </p>
        </Card>
      )}

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        className="w-full"
        size="lg"
        disabled={isChain === null}
      >
        Continue
      </Button>
    </div>
  );
}

export default Step7PropertyChain;
