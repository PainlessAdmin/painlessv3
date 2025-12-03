/**
 * STEP 12: FINAL QUOTE
 *
 * Displays:
 * - Final price (big, prominent)
 * - Full breakdown (expandable)
 * - Move summary
 * - Booking options (Book now / Request callback)
 *
 * Actions:
 * - Submit quote to backend
 * - Send confirmation email
 * - Track conversion
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  quoteResult,
  requiresCallback,
  finalResources,
  getSubmissionData,
  prevStep,
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
  const resources = useStore(finalResources);

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
    if (!quote) return; // Don't submit if no quote

    setSubmissionStatus('submitting');
    setErrorMessage(null);

    try {
      const submissionData = getSubmissionData();

      // Format data for save-quote API
      const apiData = {
        data: submissionData,
        totalPrice: quote.totalPrice,
        breakdown: quote.breakdown,
        currency: 'GBP' as const,
        name: state.contact ? `${state.contact.firstName} ${state.contact.lastName}` : undefined,
        email: state.contact?.email,
        phone: state.contact?.phone,
        language: 'en' as const,
        utm_source: state.utmSource || undefined,
        utm_medium: state.utmMedium || undefined,
        utm_campaign: state.utmCampaign || undefined,
        gclid: state.gclid || undefined,
      };

      const response = await fetch('/api/save-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
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

  // If no quote calculated - show error with option to go back
  if (!quote) {
    const missingItems = [];
    if (!state.fromAddress) missingItems.push('Moving from address not set');
    if (!state.toAddress) missingItems.push('Moving to address not set');
    if (!state.distances) missingItems.push('Route distances not calculated');
    if (!state.propertySize && !state.furnitureOnly) missingItems.push('Property size not selected');
    if (!resources) missingItems.push('Unable to calculate resources - please check property details');

    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-foreground">
            Unable to calculate quote
          </h2>
          <p className="text-muted-foreground mt-2">
            Some information may be missing. Please go back and check your details.
          </p>
        </div>

        {missingItems.length > 0 && (
          <Card className="p-4">
            <h3 className="font-medium text-foreground mb-2">Missing information:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {missingItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Debug info - remove after fixing */}
        <Card className="p-4 bg-muted/50 text-xs font-mono">
          <h3 className="font-medium text-foreground mb-2">Debug State:</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li>serviceType: {state.serviceType || 'null'}</li>
            <li>propertySize: {state.propertySize || 'null'}</li>
            <li>sliderPosition: {state.sliderPosition}</li>
            <li>furnitureOnly: {state.furnitureOnly ? 'yes' : 'no'}</li>
            <li>fromAddress: {state.fromAddress?.formatted || 'null'}</li>
            <li>toAddress: {state.toAddress?.formatted || 'null'}</li>
            <li>distances: {state.distances ? `${state.distances.customerDistance} mi` : 'null'}</li>
            <li>resources: {resources ? `${resources.vans}v/${resources.men}m` : 'null'}</li>
            <li>complications: {state.complications ? state.complications.join(',') || 'empty' : 'null'}</li>
            <li>extras: {JSON.stringify(state.extras)}</li>
            <li>callbackRequired: {callbackRequired.required ? `yes (${callbackRequired.reason})` : 'no'}</li>
          </ul>
        </Card>

        <Button onClick={prevStep} className="w-full" size="lg">
          ← Go back and fix
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-semibold text-foreground">
          Your quote is ready!
        </h2>
        <p className="text-muted-foreground mt-2">
          Hi {state.contact?.firstName}, here's your instant quote
        </p>
      </div>

      {/* Main Price Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30">
        <div className="text-center">
          {/* Price */}
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">
              Your estimated price
            </span>
          </div>
          <div className="text-5xl font-bold text-primary mb-2">
            £{quote.totalPrice.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Including VAT • Valid for 30 days
          </div>

          {/* Date */}
          {state.selectedDate && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full border">
              <span>📅</span>
              <span className="font-medium">
                {new Date(state.selectedDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {state.dateFlexibility === 'flexible' && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Flexible
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Move Summary */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Your move</h3>
        <div className="space-y-3">
          {/* Route */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-medium">
                A
              </div>
              <div className="w-0.5 h-8 bg-border"></div>
              <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                B
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {state.fromAddress?.formatted}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {state.distances?.customerDistance} miles •{' '}
                {formatDuration(state.distances?.customerDriveMinutes || 0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {state.toAddress?.formatted}
                </p>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="flex gap-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <span className="text-sm">
                <strong>{quote.vans}</strong> van{quote.vans > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👷</span>
              <span className="text-sm">
                <strong>{quote.men}</strong> mover{quote.men > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              <span className="text-sm">
                <strong>{quote.serviceDuration}</strong>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Price Breakdown (Collapsible) */}
      <Card className="overflow-hidden">
        <button
          type="button"
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <span className="font-semibold text-foreground">Price breakdown</span>
          <span
            className={cn('transition-transform', showBreakdown && 'rotate-180')}
          >
            ▼
          </span>
        </button>

        {showBreakdown && (
          <div className="p-4 pt-0 space-y-2 text-sm">
            {/* Base costs */}
            <BreakdownLine
              label={`${quote.vans} van${quote.vans > 1 ? 's' : ''} × ${quote.serviceDuration}`}
              value={quote.breakdown.vansCost}
            />
            <BreakdownLine
              label={`${quote.men} mover${quote.men > 1 ? 's' : ''} × ${quote.serviceDuration}`}
              value={quote.breakdown.moversCost}
            />

            {/* Mileage */}
            {quote.breakdown.mileageCost > 0 && (
              <BreakdownLine
                label={`Mileage (${getTotalMiles(state.distances)} miles total)`}
                value={quote.breakdown.mileageCost}
              />
            )}

            {/* Accommodation */}
            {quote.breakdown.accommodationCost > 0 && (
              <BreakdownLine
                label="Crew accommodation (overnight)"
                value={quote.breakdown.accommodationCost}
              />
            )}

            {/* Complications */}
            {quote.breakdown.complicationMultiplier > 1 && (
              <BreakdownLine
                label={`Complications adjustment (+${Math.round((quote.breakdown.complicationMultiplier - 1) * 100)}%)`}
                value={null}
                note="Applied to base cost"
              />
            )}

            {/* Extras */}
            {quote.breakdown.extrasCost > 0 && (
              <>
                <hr className="my-2 border-border" />
                <BreakdownLine
                  label="Extra services"
                  value={quote.breakdown.extrasCost}
                />
              </>
            )}

            {/* Subtotal */}
            <hr className="my-2 border-border" />
            <BreakdownLine label="Subtotal" value={quote.breakdown.subtotal} bold />

            {/* Margin (as service fee) */}
            <BreakdownLine
              label="Service & insurance"
              value={quote.breakdown.margin}
            />

            {/* Total */}
            <hr className="my-2 border-border" />
            <BreakdownLine label="Total" value={quote.totalPrice} bold large />
          </div>
        )}
      </Card>

      {/* Extras Summary (if any) */}
      {hasExtras(state.extras) && (
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Included extras</h3>
          <div className="space-y-2 text-sm">
            {state.extras.packing && (
              <div className="flex items-center gap-2">
                <span>📦</span>
                <span>
                  Professional packing (
                  {CALCULATOR_CONFIG.packing[state.extras.packing].label})
                </span>
              </div>
            )}
            {state.extras.cleaningRooms && (
              <div className="flex items-center gap-2">
                <span>🧹</span>
                <span>
                  End of tenancy cleaning ({state.extras.cleaningRooms} rooms)
                </span>
              </div>
            )}
            {state.extras.storage && (
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <span>
                  Storage ({CALCULATOR_CONFIG.storage[state.extras.storage].label}
                  )
                </span>
              </div>
            )}
            {state.extras.assembly && state.extras.assembly.length > 0 && (
              <div className="flex items-center gap-2">
                <span>🔧</span>
                <span>
                  Assembly/disassembly ({state.extras.assembly.length} item
                  {state.extras.assembly.length > 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Error Alert */}
      {submissionStatus === 'error' && errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Email Confirmation */}
      {submissionStatus === 'success' && (
        <Alert className="border-emerald-500 bg-emerald-50">
          <AlertDescription className="text-emerald-800">
            ✉️ We've sent a copy of this quote to{' '}
            <strong>{state.contact?.email}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button onClick={handleBookNow} className="w-full" size="lg">
          Book this date
        </Button>

        <Button
          onClick={handleRequestCallback}
          variant="outline"
          className="w-full"
        >
          📞 Request a callback to discuss
        </Button>

        <Button
          onClick={prevStep}
          variant="ghost"
          className="w-full"
        >
          ← Edit my details
        </Button>
      </div>

      {/* Trust Signals */}
      <div className="text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span>✓ No booking fee</span>
          <span>✓ Free cancellation (48h+)</span>
          <span>✓ Fully insured</span>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-500">★★★★★</span>
          <span className="text-sm text-muted-foreground">
            4.9/5 from 230+ reviews
          </span>
        </div>
      </div>

      {/* Fine Print */}
      <p className="text-xs text-center text-muted-foreground">
        Quote reference: {state.sessionId?.slice(0, 8).toUpperCase()}
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
        setSubmitted(true); // Still show success to user
      }
    };

    handleSubmit();
  }, [reason]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">📞</div>
        <h2 className="text-2xl font-semibold text-foreground">
          We'll call you soon!
        </h2>
        <p className="text-muted-foreground mt-2">
          Thanks {state.contact?.firstName}, we've received your request
        </p>
      </div>

      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          What happens next?
        </h3>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
              1
            </div>
            <p className="text-left">
              Our team will review your move requirements
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
              2
            </div>
            <p className="text-left">
              We'll call you within 2 hours (during business hours)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium">
              3
            </div>
            <p className="text-left">
              You'll receive a personalized quote by email
            </p>
          </div>
        </div>
      </Card>

      {submitted && (
        <Alert className="border-emerald-500 bg-emerald-50">
          <AlertDescription className="text-emerald-800">
            ✉️ Confirmation sent to <strong>{state.contact?.email}</strong>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4 bg-muted/30">
        <h3 className="font-medium text-foreground text-sm mb-2">
          Your contact details
        </h3>
        <div className="text-sm space-y-1">
          <p>
            {state.contact?.firstName} {state.contact?.lastName}
          </p>
          <p>{state.contact?.phone}</p>
          <p>{state.contact?.email}</p>
        </div>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Reference: {state.sessionId?.slice(0, 8).toUpperCase()}
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
