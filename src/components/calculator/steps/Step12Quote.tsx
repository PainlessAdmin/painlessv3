/**
 * STEP 12: FINAL QUOTE
 *
 * Displays:
 * - Final price (big, prominent)
 * - Full breakdown (expandable)
 * - Move summary
 * - Booking options (Book now / Request callback)
 *
 * Enhanced with split layout and refined styling.
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  quoteResult,
  requiresCallback,
  getSubmissionData,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG } from '@/lib/calculator-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// Extend Window for GTM dataLayer
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export function Step12Quote() {
  const state = useStore(calculatorStore);
  const quote = useStore(quoteResult);
  const callbackRequired = useStore(requiresCallback);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-submit quote on mount
  useEffect(() => {
    submitQuote();
  }, []);

  // Submit quote to backend
  const submitQuote = async () => {
    if (submissionStatus === 'submitting' || submissionStatus === 'success') return;

    setSubmissionStatus('submitting');
    setErrorMessage(null);

    try {
      const submissionData = getSubmissionData();

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote');
      }

      const result = await response.json();

      // Track conversion (GTM)
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'quote_completed',
          quote_id: result.quoteId,
          quote_value: quote?.totalPrice,
          service_type: state.serviceType,
        });
      }

      setSubmissionStatus('success');
    } catch (error) {
      console.error('Quote submission error:', error);
      setSubmissionStatus('error');
      setErrorMessage(
        "There was a problem saving your quote. Don't worry - your quote is still valid!"
      );
    }
  };

  // Handle booking request
  const handleBookNow = () => {
    window.location.href = `/book?quote=${state.sessionId}`;
  };

  // Handle callback request
  const handleRequestCallback = () => {
    window.location.href = `/callback?quote=${state.sessionId}`;
  };

  // If callback required (specialist items or >2000 cubes)
  if (callbackRequired.required) {
    return <CallbackRequiredView state={state} reason={callbackRequired.reason} />;
  }

  // If no quote calculated
  if (!quote) {
    return (
      <div className="step-container text-center py-12">
        <Spinner className="h-10 w-10 mx-auto" />
        <p className="mt-4 text-lg text-muted-foreground">Calculating your quote...</p>
      </div>
    );
  }

  return (
    <div className="step-container space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">
          Your quote is ready!
        </h1>
        <p className="text-muted-foreground mt-2">
          Hi {state.contact?.firstName}, here's your instant quote
        </p>
      </div>

      {/* Main Price Card - Enhanced */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-primary/30 shadow-xl">
        <div className="text-center">
          {/* Price Label */}
          <div className="mb-2">
            <span className="text-sm font-medium text-primary/70 uppercase tracking-wider">
              Your estimated price
            </span>
          </div>

          {/* Big Price Display */}
          <div className="text-6xl md:text-7xl font-bold text-primary mb-3">
            £{quote.totalPrice.toLocaleString()}
          </div>

          <div className="text-sm text-muted-foreground">
            Including VAT • Valid for 30 days
          </div>

          {/* Date Badge */}
          {state.selectedDate && (
            <div className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-white rounded-full shadow-sm border">
              <span className="text-xl">📅</span>
              <span className="font-semibold">
                {new Date(state.selectedDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {state.dateFlexibility === 'flexible' && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                  Flexible
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons - Prominent */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={handleBookNow} className="btn-primary py-5 text-lg w-full">
          Book this date
        </Button>
        <Button
          onClick={handleRequestCallback}
          variant="outline"
          className="py-5 text-lg w-full"
        >
          📞 Request callback
        </Button>
      </div>

      {/* Email Confirmation */}
      {submissionStatus === 'success' && (
        <Alert className="border-emerald-500 bg-emerald-50">
          <AlertDescription className="text-emerald-800 text-center">
            ✉️ We've sent a copy of this quote to <strong>{state.contact?.email}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {submissionStatus === 'error' && errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Move Summary Card */}
      <Card className="p-5 bg-white shadow-lg">
        <h3 className="font-semibold text-foreground mb-4 text-lg">Your move details</h3>

        {/* Route */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <div className="w-0.5 h-10 bg-gray-200"></div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
              B
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {state.fromAddress?.formatted}
              </p>
            </div>
            <div className="text-xs text-muted-foreground bg-gray-100 inline-block px-3 py-1 rounded-full">
              {state.distances?.customerDistance} miles • {formatDuration(state.distances?.customerDriveMinutes || 0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {state.toAddress?.formatted}
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="flex gap-4 pt-4 border-t">
          <div className="flex-1 text-center p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">🚚</span>
            <div className="font-bold text-lg text-foreground">{quote.vans}</div>
            <div className="text-xs text-muted-foreground">van{quote.vans > 1 ? 's' : ''}</div>
          </div>
          <div className="flex-1 text-center p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">👷</span>
            <div className="font-bold text-lg text-foreground">{quote.men}</div>
            <div className="text-xs text-muted-foreground">mover{quote.men > 1 ? 's' : ''}</div>
          </div>
          <div className="flex-1 text-center p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">⏱️</span>
            <div className="font-bold text-lg text-foreground">{quote.serviceDuration}</div>
            <div className="text-xs text-muted-foreground">duration</div>
          </div>
        </div>
      </Card>

      {/* Price Breakdown (Collapsible) */}
      <Card className="overflow-hidden bg-white shadow-lg">
        <button
          type="button"
          className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <span className="font-semibold text-foreground">View price breakdown</span>
          <span className={cn(
            'transition-transform duration-200 text-primary',
            showBreakdown && 'rotate-180'
          )}>
            ▼
          </span>
        </button>

        {showBreakdown && (
          <div className="p-5 pt-0 space-y-3 text-sm border-t">
            <BreakdownLine
              label={`${quote.vans} van${quote.vans > 1 ? 's' : ''} × ${quote.serviceDuration}`}
              value={quote.breakdown.vansCost}
            />
            <BreakdownLine
              label={`${quote.men} mover${quote.men > 1 ? 's' : ''} × ${quote.serviceDuration}`}
              value={quote.breakdown.moversCost}
            />

            {quote.breakdown.mileageCost > 0 && (
              <BreakdownLine
                label={`Mileage (${getTotalMiles(state.distances)} miles total)`}
                value={quote.breakdown.mileageCost}
              />
            )}

            {quote.breakdown.accommodationCost > 0 && (
              <BreakdownLine
                label="Crew accommodation (overnight)"
                value={quote.breakdown.accommodationCost}
              />
            )}

            {quote.breakdown.complicationMultiplier > 1 && (
              <BreakdownLine
                label={`Complications (+${Math.round((quote.breakdown.complicationMultiplier - 1) * 100)}%)`}
                value={null}
                note="Applied to base cost"
              />
            )}

            {quote.breakdown.extrasCost > 0 && (
              <>
                <hr className="my-2 border-border" />
                <BreakdownLine
                  label="Extra services"
                  value={quote.breakdown.extrasCost}
                />
              </>
            )}

            <hr className="my-2 border-border" />
            <BreakdownLine label="Subtotal" value={quote.breakdown.subtotal} bold />
            <BreakdownLine
              label="Service & insurance"
              value={quote.breakdown.margin}
            />

            <hr className="my-2 border-border" />
            <BreakdownLine label="Total" value={quote.totalPrice} bold large />
          </div>
        )}
      </Card>

      {/* Extras Summary (if any) */}
      {hasExtras(state.extras) && (
        <Card className="p-5 bg-white shadow-lg">
          <h3 className="font-semibold text-foreground mb-3">Included extras</h3>
          <div className="grid gap-2 text-sm">
            {state.extras.packing && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                <span>📦</span>
                <span>Professional packing ({CALCULATOR_CONFIG.packing[state.extras.packing].label})</span>
              </div>
            )}
            {state.extras.cleaningRooms && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <span>🧹</span>
                <span>End of tenancy cleaning ({state.extras.cleaningRooms} rooms)</span>
              </div>
            )}
            {state.extras.storage && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <span>🏠</span>
                <span>Storage ({CALCULATOR_CONFIG.storage[state.extras.storage].label})</span>
              </div>
            )}
            {state.extras.assembly && state.extras.assembly.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                <span>🔧</span>
                <span>Assembly ({state.extras.assembly.length} item{state.extras.assembly.length > 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Trust Signals */}
      <div className="text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">✓ No booking fee</span>
          <span className="flex items-center gap-1">✓ Free cancellation (48h+)</span>
          <span className="flex items-center gap-1">✓ Fully insured</span>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-500 text-lg">★★★★★</span>
          <span className="text-sm text-muted-foreground">
            4.9/5 from 230+ reviews
          </span>
        </div>
      </div>

      {/* Fine Print */}
      <p className="text-xs text-center text-muted-foreground">
        Quote reference: <strong>{state.sessionId?.slice(0, 8).toUpperCase()}</strong>
        <br />
        Valid until {getValidUntilDate()}. Price may vary if move details change.
      </p>
    </div>
  );
}

// ===================
// SUB-COMPONENTS
// ===================

interface BreakdownLineProps {
  label: string;
  value: number | null;
  note?: string;
  bold?: boolean;
  large?: boolean;
}

function BreakdownLine({ label, value, note, bold, large }: BreakdownLineProps) {
  return (
    <div
      className={cn(
        'flex justify-between items-center',
        bold && 'font-semibold',
        large && 'text-lg'
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(bold && 'text-foreground')}>
        {value !== null ? `£${value.toLocaleString()}` : '—'}
        {note && (
          <span className="text-xs text-muted-foreground ml-1">{note}</span>
        )}
      </span>
    </div>
  );
}

// ===================
// CALLBACK REQUIRED VIEW
// ===================

interface CallbackRequiredViewProps {
  state: ReturnType<typeof calculatorStore.get>;
  reason?: string;
}

function CallbackRequiredView({ state, reason }: CallbackRequiredViewProps) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleSubmit = async () => {
      try {
        const submissionData = getSubmissionData();

        await fetch('/api/callbacks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...submissionData,
            callbackReason: reason,
          }),
        });

        setSubmitted(true);
      } catch (error) {
        console.error('Callback submission error:', error);
        setSubmitted(true);
      }
    };

    handleSubmit();
  }, [reason]);

  return (
    <div className="step-container space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-4xl">📞</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary">
          We'll call you soon!
        </h1>
        <p className="text-muted-foreground mt-2">
          Thanks {state.contact?.firstName}, we've received your request
        </p>
      </div>

      <Card className="p-6 bg-white shadow-lg text-center">
        <h3 className="text-lg font-semibold text-foreground mb-5">
          What happens next?
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold flex-shrink-0">
              1
            </div>
            <p className="text-sm text-muted-foreground">
              Our team will review your move requirements
            </p>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold flex-shrink-0">
              2
            </div>
            <p className="text-sm text-muted-foreground">
              We'll call you within 2 hours (during business hours)
            </p>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold flex-shrink-0">
              3
            </div>
            <p className="text-sm text-muted-foreground">
              You'll receive a personalized quote by email
            </p>
          </div>
        </div>
      </Card>

      {submitted && (
        <Alert className="border-emerald-500 bg-emerald-50">
          <AlertDescription className="text-emerald-800 text-center">
            ✉️ Confirmation sent to <strong>{state.contact?.email}</strong>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-5 bg-gray-50 shadow-sm">
        <h3 className="font-semibold text-foreground text-sm mb-3">
          Your contact details
        </h3>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p className="font-medium text-foreground">
            {state.contact?.firstName} {state.contact?.lastName}
          </p>
          <p>{state.contact?.phone}</p>
          <p>{state.contact?.email}</p>
        </div>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Reference: <strong>{state.sessionId?.slice(0, 8).toUpperCase()}</strong>
        <br />
        Business hours: Mon-Sat 8am-6pm
      </p>
    </div>
  );
}

// ===================
// HELPER FUNCTIONS
// ===================

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

function getValidUntilDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + CALCULATOR_CONFIG.validation.quoteValidDays);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getTotalMiles(
  distances: { depotToFrom: number; fromToTo: number; toToDepot: number } | null
): number {
  if (!distances) return 0;
  return Math.round(
    distances.depotToFrom + distances.fromToTo + distances.toToDepot
  );
}

function hasExtras(extras: {
  packing?: string;
  cleaningRooms?: number;
  storage?: string;
  assembly?: Array<{ type: string; quantity: number }>;
}): boolean {
  return Boolean(
    extras?.packing ||
      extras?.cleaningRooms ||
      extras?.storage ||
      (extras?.assembly && extras.assembly.length > 0)
  );
}

export default Step12Quote;
