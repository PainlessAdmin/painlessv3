/**
 * STEP 1: SERVICE TYPE SELECTION
 *
 * User selects: Home Removal | Office Removal | Clearance Service
 */

import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setServiceType,
  nextStep,
  type ServiceType
} from '@/lib/calculator-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Service options with images and descriptions
const serviceOptions: Array<{
  value: ServiceType;
  label: string;
  description: string;
  image: string;
}> = [
  {
    value: 'home',
    label: 'Home Removal',
    description: 'Moving house? We handle everything from studios to 5+ bed homes.',
    image: '/images/services/home-removal.svg',
  },
  {
    value: 'office',
    label: 'Office Removal',
    description: 'Relocating your business? Minimal downtime, maximum care.',
    image: '/images/services/office-removal.svg',
  },
  {
    value: 'clearance',
    label: 'Clearance Service',
    description: 'House clearance, rubbish removal, or end of tenancy clear-outs.',
    image: '/images/services/clearance.svg',
  },
];

export function Step1ServiceType() {
  const state = useStore(calculatorStore);
  const selectedType = state.serviceType;

  const handleBack = () => {
    window.location.href = '/';
  };

  const handleSelect = (type: ServiceType) => {
    setServiceType(type);

    // Clearance redirects to separate calculator
    if (type === 'clearance') {
      window.location.href = '/clearance-calculator';
      return;
    }

    // Otherwise proceed to next step
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Button>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          What type of service do you need?
        </h2>
        <p className="text-muted-foreground mt-2">
          Select one to get started with your instant quote
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {serviceOptions.map((option) => (
          <ServiceCard
            key={option.value}
            option={option}
            isSelected={selectedType === option.value}
            onSelect={() => handleSelect(option.value)}
          />
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Free quote
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          No obligation
        </span>
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Takes 2 minutes
        </span>
      </div>
    </div>
  );
}

// ===================
// SUB-COMPONENTS
// ===================

interface ServiceCardProps {
  option: {
    value: ServiceType;
    label: string;
    description: string;
    image: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function ServiceCard({ option, isSelected, onSelect }: ServiceCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-lg border-2 bg-card overflow-hidden transition-all duration-200',
        'hover:border-primary hover:-translate-y-1 hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border'
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      )}

      {/* Image */}
      <div className="w-full h-32 bg-secondary/50 flex items-center justify-center">
        <img
          src={option.image}
          alt={option.label}
          className="w-full h-full object-contain p-4"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Label */}
        <h3 className="font-semibold text-lg text-foreground text-center">
          {option.label}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {option.description}
        </p>
      </div>
    </div>
  );
}

export default Step1ServiceType;
