/**
 * STEP 10C: CLEANING SERVICE
 *
 * Allow users to add end-of-tenancy or move-out cleaning to their quote.
 * Features room selection and quick/deep cleaning toggle.
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setCleaningDetails,
  nextStep,
  prevStep,
  type CleaningType,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG } from '@/lib/calculator-config';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { cn } from '@/lib/utils';

// Room options (1-6 bedrooms)
const ROOM_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

// Format currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(price);
}

// Get estimated rooms from property size
function getEstimatedRooms(propertySize: string | null): number {
  const roomMap: Record<string, number> = {
    'studio': 1,
    '1bed': 1,
    '2bed': 2,
    '3bed-small': 3,
    '3bed-large': 3,
    '4bed': 4,
    '5bed': 5,
    '5bed-plus': 6,
  };
  return propertySize ? (roomMap[propertySize] || 2) : 2;
}

export function Step10cCleaning() {
  const state = useStore(calculatorStore);

  // Get pre-selected rooms from property size
  const estimatedRooms = getEstimatedRooms(state.propertySize);

  // Local state
  const [selectedRooms, setSelectedRooms] = useState<number>(
    state.extras.cleaningRooms || estimatedRooms
  );
  const [cleaningType, setCleaningType] = useState<CleaningType>(
    state.extras.cleaningType || 'quick'
  );

  // Calculate price
  const basePrice = CALCULATOR_CONFIG.cleaning[selectedRooms as keyof typeof CALCULATOR_CONFIG.cleaning]?.price || 120;
  const multiplier = CALCULATOR_CONFIG.cleaningTiers[cleaningType].multiplier;
  const finalPrice = Math.round(basePrice * multiplier);

  // Sync with store on mount
  useEffect(() => {
    if (state.extras.cleaningRooms) {
      setSelectedRooms(state.extras.cleaningRooms);
    }
    if (state.extras.cleaningType) {
      setCleaningType(state.extras.cleaningType);
    }
  }, [state.extras.cleaningRooms, state.extras.cleaningType]);

  // Handle continue
  const handleContinue = () => {
    setCleaningDetails(selectedRooms, cleaningType);
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          How many bedrooms do you need cleaned?
        </h2>
        <p className="text-muted-foreground mt-2">
          Professional cleaning to help you get your deposit back
        </p>
      </div>

      {/* Upsell message */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Focus on your move</span> - let our professional cleaners
          handle the old property. Includes kitchen, bathrooms, all bedrooms, and living areas.
        </p>
      </div>

      {/* Cleaning type toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
          {(Object.entries(CALCULATOR_CONFIG.cleaningTiers) as [CleaningType, typeof CALCULATOR_CONFIG.cleaningTiers.quick][]).map(
            ([type, config]) => (
              <button
                key={type}
                type="button"
                onClick={() => setCleaningType(type)}
                className={cn(
                  'relative px-6 py-2 rounded-md text-sm font-medium transition-all',
                  cleaningType === type
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {config.label}
                {'badge' in config && (config as { badge?: string }).badge && cleaningType !== type && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full">
                    {(config as { badge?: string }).badge}
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Type description */}
      <p className="text-center text-sm text-muted-foreground">
        {CALCULATOR_CONFIG.cleaningTiers[cleaningType].description}
        {cleaningType === 'deep' && (
          <span className="text-primary"> (60% more thorough)</span>
        )}
      </p>

      {/* Room selection grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {ROOM_OPTIONS.map((rooms) => {
          const roomBasePrice = CALCULATOR_CONFIG.cleaning[rooms]?.price || 120;
          const roomFinalPrice = Math.round(roomBasePrice * multiplier);
          const isSelected = selectedRooms === rooms;
          const isEstimated = rooms === estimatedRooms;

          return (
            <RoomCard
              key={rooms}
              rooms={rooms}
              price={roomFinalPrice}
              isSelected={isSelected}
              isEstimated={isEstimated}
              onSelect={() => setSelectedRooms(rooms)}
            />
          );
        })}
      </div>

      {/* What's included */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-2">Includes:</h3>
        <ul className="grid grid-cols-2 gap-2">
          {[
            'Kitchen deep clean',
            'All bathrooms',
            'All bedrooms',
            'Living areas',
            'Windows (interior)',
            cleaningType === 'deep' ? 'Oven cleaning' : 'Surface cleaning',
          ].map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Price summary */}
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
        <span className="text-foreground font-medium">
          {selectedRooms} bedroom{selectedRooms > 1 ? 's' : ''} - {CALCULATOR_CONFIG.cleaningTiers[cleaningType].label}:
        </span>
        <span className="text-2xl font-bold text-primary">{formatPrice(finalPrice)}</span>
      </div>

      {/* Navigation */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        nextLabel="Continue"
      />
    </div>
  );
}

// Room selection card
interface RoomCardProps {
  rooms: number;
  price: number;
  isSelected: boolean;
  isEstimated: boolean;
  onSelect: () => void;
}

function RoomCard({
  rooms,
  price,
  isSelected,
  isEstimated,
  onSelect,
}: RoomCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-xl border-2 p-3',
        'transition-all duration-300 ease-out',
        'border-border shadow-sm',
        !isSelected && 'hover:border-primary/50 hover:shadow-lg',
        isSelected && [
          'border-primary bg-primary/5',
          'shadow-lg shadow-primary/10',
          'ring-2 ring-primary ring-offset-2 ring-offset-background',
        ],
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="radio"
      aria-checked={isSelected}
    >
      {/* Pre-selected indicator */}
      {isEstimated && !isSelected && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full whitespace-nowrap">
          Your size
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs shadow-md">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Room number with bedroom icon */}
      <div className="text-center">
        <div className={cn(
          'text-2xl font-bold transition-colors',
          isSelected ? 'text-primary' : 'text-foreground'
        )}>
          {rooms}
        </div>
        <div className="text-xs text-muted-foreground">
          {rooms === 1 ? 'bed' : 'beds'}
        </div>
        <div className={cn(
          'text-sm font-semibold mt-1 transition-colors',
          isSelected ? 'text-primary' : 'text-muted-foreground'
        )}>
          {formatPrice(price)}
        </div>
      </div>
    </div>
  );
}

export default Step10cCleaning;
