/**
 * STEP 7: PROPERTY CHAIN
 *
 * Simple yes/no question with auto-next.
 * If yes, shows info page before continuing.
 * Property chain = minimum full day booking.
 *
 * Uses DaisyUI cards with 1:1 images and microinteractions
 */

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setPropertyChain,
  nextStep,
  prevStep,
} from '@/lib/calculator-store';
import { SelectionCard } from '@/components/ui/selection-card';
import { Card } from '@/components/ui/card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';

export function Step7PropertyChain() {
  const state = useStore(calculatorStore);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isChain, setIsChain] = useState<boolean | null>(
    state.propertyChain
  );
  const [showExplanation, setShowExplanation] = useState(false);
  // Internal page: 1 = question, 2 = chain info (only if yes)
  const [internalPage, setInternalPage] = useState(1);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (value: boolean) => {
    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    setIsChain(value);

    // Auto-navigate after short delay
    navigationTimeoutRef.current = setTimeout(() => {
      navigationTimeoutRef.current = null;
      setPropertyChain(value);

      if (value) {
        // If yes, show info page
        setInternalPage(2);
      } else {
        // If no, go to next step
        nextStep();
      }
    }, 400);
  };

  const handleContinueFromInfo = () => {
    nextStep();
  };

  const handleBackFromInfo = () => {
    setInternalPage(1);
    setIsChain(null);
  };

  // Page 2: Chain info
  if (internalPage === 2) {
    return (
      <div className="step-container">
        {/* Heading */}
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-semibold text-base-content">
            Property chain moves
          </h2>
          <p className="text-base-content/60 mt-2">
            Here's what you need to know
          </p>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-secondary border-primary/20 animate-scale-in">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="font-semibold text-base-content">Full day reservation</h3>
                <p className="text-sm text-base-content/60">
                  We'll reserve a full day for your move to ensure we can accommodate any delays in the chain.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="font-semibold text-base-content">Experienced team</h3>
                <p className="text-sm text-base-content/60">
                  Our team is experienced with chain completions and understands the pressures involved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <h3 className="font-semibold text-base-content">Close communication</h3>
                <p className="text-sm text-base-content/60">
                  We'll stay in close contact throughout the day to coordinate timing with solicitors and estate agents.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Buttons */}
        <NavigationButtons
          onPrevious={handleBackFromInfo}
          onNext={handleContinueFromInfo}
          nextLabel="Continue"
        />
      </div>
    );
  }

  // Page 1: Question
  return (
    <div className="step-container">
      {/* Heading */}
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-semibold text-base-content">
          Are you part of a property chain?
        </h2>
        <p className="text-base-content/60 mt-2">
          This affects scheduling and availability
        </p>
      </div>

      {/* Options - 2 cols */}
      <div className="grid gap-4 grid-cols-2">
        {/* Yes */}
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <SelectionCard
            value="yes"
            label="Yes, I'm in a chain"
            description="Multiple completions on the same day"
            imageSrc="/images/calculator/step7/chain-yes.svg"
            isSelected={isChain === true}
            onSelect={() => handleSelect(true)}
          />
        </div>

        {/* No */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <SelectionCard
            value="no"
            label="No, independent"
            description="No other transactions depend on mine"
            imageSrc="/images/calculator/step7/chain-no.svg"
            isSelected={isChain === false}
            onSelect={() => handleSelect(false)}
          />
        </div>
      </div>

      {/* Not sure helper */}
      <div className="text-center animate-fade-in">
        <button
          type="button"
          className="btn btn-ghost btn-sm text-base-content/60"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          What's a property chain?
        </button>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <Card className="p-4 bg-base-200 animate-scale-in">
          <p className="text-sm text-base-content/70">
            <strong className="text-base-content">A property chain</strong> is when multiple house sales depend on each other. For example: you're buying a house from someone who is also buying another house on the same day. All transactions must complete together.
          </p>
          <p className="text-sm text-base-content/70 mt-2">
            If any part of the chain is delayed, it affects everyone. That's why we reserve a full day for chain moves - to ensure flexibility if completion times shift.
          </p>
        </Card>
      )}

      {/* Navigation Buttons */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={() => {}}
        canGoNext={false}
        nextLabel="Continue"
      />
    </div>
  );
}

export default Step7PropertyChain;
