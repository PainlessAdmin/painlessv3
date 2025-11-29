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
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Service options with icons and descriptions
const serviceOptions: Array<{
  value: ServiceType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'home',
    label: 'Home Removal',
    description: 'Moving house? We handle everything from studios to 5+ bed homes.',
    icon: '🏠',
  },
  {
    value: 'office',
    label: 'Office Removal',
    description: 'Relocating your business? Minimal downtime, maximum care.',
    icon: '🏢',
  },
  {
    value: 'clearance',
    label: 'Clearance Service',
    description: 'House clearance, rubbish removal, or end of tenancy clear-outs.',
    icon: '🗑️',
  },
];

export function Step1ServiceType() {
  const state = useStore(calculatorStore);
  const selectedType = state.serviceType;

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
      <div className="grid gap-4 sm:grid-cols-3">
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
    icon: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

function ServiceCard({ option, isSelected, onSelect }: ServiceCardProps) {
  return (
    <Card
      className={cn(
        'relative cursor-pointer p-6 transition-all duration-200',
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
        <div className="absolute top-3 right-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
            ✓
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="text-4xl mb-4">{option.icon}</div>

      {/* Label */}
      <h3 className="font-semibold text-lg text-foreground">
        {option.label}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mt-2">
        {option.description}
      </p>
    </Card>
  );
}

export default Step1ServiceType;
