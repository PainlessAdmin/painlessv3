/**
 * STEP 1: SERVICE TYPE SELECTION
 *
 * User selects: Home Removal | Office Removal | Clearance Service
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setServiceType,
  nextStep,
  type ServiceType
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
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
    image: '/images/calculator/home-removal.svg',
  },
  {
    value: 'office',
    label: 'Office Removal',
    description: 'Relocating your business? Minimal downtime, maximum care.',
    image: '/images/calculator/office-removal.svg',
  },
  {
    value: 'clearance',
    label: 'Clearance Service',
    description: 'House clearance, rubbish removal, or end of tenancy clear-outs.',
    image: '/images/calculator/clearance.svg',
  },
];

export function Step1ServiceType() {
  const state = useStore(calculatorStore);
  const [selectedType, setSelectedTypeLocal] = useState<ServiceType | null>(state.serviceType);

  const handleSelect = (type: ServiceType) => {
    setSelectedTypeLocal(type);
    setServiceType(type);

    // Clearance redirects to separate calculator
    if (type === 'clearance') {
      window.location.href = '/clearance-calculator';
      return;
    }

    // Auto-next after selection
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  const handleNext = () => {
    if (!selectedType) return;

    if (selectedType === 'clearance') {
      window.location.href = '/clearance-calculator';
      return;
    }

    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          What type of service do you need?
        </h2>
        <p className="text-muted-foreground mt-2">
          Select one to get started with your instant quote
        </p>
      </div>

      {/* Service Cards - 2 columns on mobile, 3 on desktop */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
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
      <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <span>✓</span> Free quote
        </span>
        <span className="flex items-center gap-1">
          <span>✓</span> No obligation
        </span>
        <span className="flex items-center gap-1">
          <span>✓</span> Takes 2 minutes
        </span>
      </div>

      {/* Navigation Buttons */}
      <NavigationButtons
        onNext={handleNext}
        canGoNext={!!selectedType}
        nextLabel="Continue"
      />
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
    <Card
      className={cn(
        'relative cursor-pointer p-4 transition-all duration-200',
        'hover:border-primary hover:-translate-y-1 hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isSelected && 'border-primary bg-primary/5 ring-2 ring-primary'
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
        <div className="absolute top-2 right-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
            ✓
          </span>
        </div>
      )}

      {/* Image */}
      <div className="flex justify-center mb-3">
        <img
          src={option.image}
          alt={option.label}
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
        />
      </div>

      {/* Label */}
      <h3 className="font-semibold text-sm sm:text-base text-foreground text-center">
        {option.label}
      </h3>

      {/* Description - hidden on mobile */}
      <p className="text-xs text-muted-foreground mt-1 text-center hidden sm:block">
        {option.description}
      </p>
    </Card>
  );
}

export default Step1ServiceType;
