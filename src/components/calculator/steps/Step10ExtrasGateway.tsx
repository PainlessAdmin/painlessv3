/**
 * STEP 10: EXTRAS GATEWAY
 *
 * Allow users to select which additional services they want to add.
 * This is the gateway page - selected options will show their respective sub-pages.
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setExtrasGateway,
  nextStep,
  prevStep,
  type ExtrasGatewayOption,
} from '@/lib/calculator-store';
import { SelectionCardGrid } from '@/components/ui/selection-card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { cn } from '@/lib/utils';

// Gateway options configuration (base path without extension)
const GATEWAY_OPTIONS: Array<{
  value: ExtrasGatewayOption;
  title: string;
  description: string;
  image: string;
}> = [
  {
    value: 'packing',
    title: 'Professional Packing',
    description: 'Let our experts pack your belongings safely',
    image: '/images/calculator/step-10-extras/gateway/packing',
  },
  {
    value: 'assembly',
    title: 'Furniture Assembly',
    description: 'We disassemble and reassemble your furniture',
    image: '/images/calculator/step-10-extras/gateway/assembly',
  },
  {
    value: 'cleaning',
    title: 'Move-Out Cleaning',
    description: 'Professional cleaning for your old property',
    image: '/images/calculator/step-10-extras/gateway/cleaning',
  },
  {
    value: 'storage',
    title: 'Storage',
    description: 'Secure storage if your new place isn\'t ready',
    image: '/images/calculator/step-10-extras/gateway/storage',
  },
];

export function Step10ExtrasGateway() {
  const state = useStore(calculatorStore);
  const [selected, setSelected] = useState<ExtrasGatewayOption[]>(
    state.extras.gateway || []
  );

  // Sync with store on mount
  useEffect(() => {
    setSelected(state.extras.gateway || []);
  }, [state.extras.gateway]);

  // Toggle selection
  const toggleOption = (option: ExtrasGatewayOption) => {
    setSelected(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option);
      }
      return [...prev, option];
    });
  };

  // Handle continue
  const handleContinue = () => {
    setExtrasGateway(selected);
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Can we assist you with any of the following?
        </h2>
        <p className="text-muted-foreground mt-2">
          Select the services you're interested in - we'll show you options and pricing
        </p>
      </div>

      {/* Selection Grid */}
      <SelectionCardGrid columns={{ default: 2, md: 4 }}>
        {GATEWAY_OPTIONS.map(option => (
          <GatewayCard
            key={option.value}
            value={option.value}
            title={option.title}
            description={option.description}
            imageSrc={option.image}
            isSelected={selected.includes(option.value)}
            onToggle={() => toggleOption(option.value)}
          />
        ))}
      </SelectionCardGrid>

      {/* Selection summary */}
      {selected.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {selected.length === 1
              ? "You'll see 1 additional page for your selected service"
              : `You'll see ${selected.length} additional pages for your selected services`
            }
          </p>
        </div>
      )}

      {/* Skip option */}
      {selected.length === 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No worries - you can skip this if you don't need any extras
          </p>
        </div>
      )}

      {/* Navigation */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        nextLabel={selected.length > 0 ? 'Continue' : 'Skip Extras'}
      />
    </div>
  );
}

// Gateway card component with checkbox-style multi-select
interface GatewayCardProps {
  value: ExtrasGatewayOption;
  title: string;
  description: string;
  imageSrc: string;
  isSelected: boolean;
  onToggle: () => void;
}

function GatewayCard({
  value,
  title,
  description,
  imageSrc,
  isSelected,
  onToggle,
}: GatewayCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-xl border-2 bg-card text-card-foreground',
        'transition-all duration-500 ease-out',
        'border-border shadow-sm',
        !isSelected && 'hover:-translate-y-1 hover:scale-[1.02] hover:border-[#6a9c95]/50 hover:shadow-lg',
        isSelected && [
          '-translate-y-1.5 scale-[1.03]',
          'border-[#6a9c95] bg-[#6a9c95]/5',
          'shadow-xl shadow-[#6a9c95]/10',
          'ring-2 ring-[#6a9c95] ring-offset-2 ring-offset-background',
        ],
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6a9c95] focus-visible:ring-offset-2'
      )}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      tabIndex={0}
      role="checkbox"
      aria-checked={isSelected}
      data-value={value}
    >
      {/* Checkbox indicator */}
      <div
        className={cn(
          'absolute -top-2 -right-2 z-10',
          'flex h-6 w-6 items-center justify-center rounded-full',
          'bg-[#6a9c95] text-white text-xs font-bold',
          'shadow-md',
          'transition-all duration-500',
          isSelected
            ? 'scale-100 opacity-100 animate-bounce-once'
            : 'scale-0 opacity-0'
        )}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Image container - 1:1 aspect ratio, no padding */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
        <picture>
          <source srcSet={`${imageSrc}.webp`} type="image/webp" />
          <img
            src={`${imageSrc}.jpg`}
            alt={title}
            className={cn(
              'h-full w-full object-cover',
              'transition-transform duration-300 ease-out',
              isSelected && 'scale-105'
            )}
            loading="lazy"
          />
        </picture>
      </div>

      {/* Content */}
      <div className="p-3 pt-2 text-center bg-[#6a9c95] rounded-b-lg">
        <h3 className="font-semibold text-sm text-white transition-colors duration-200">
          {title}
        </h3>
        <p className="text-xs text-white/80 mt-1">{description}</p>
      </div>
    </div>
  );
}

export default Step10ExtrasGateway;
