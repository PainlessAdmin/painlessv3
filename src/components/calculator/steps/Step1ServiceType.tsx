/**
 * STEP 1: SERVICE TYPE SELECTION
 *
 * User selects: Home Removal | Office Removal | Clearance Service
 * Uses image-based option cards with auto-advance
 */

import { useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setServiceType,
  nextStep,
  type ServiceType
} from '@/lib/calculator-store';
import { OptionCard, OptionCardGrid } from '@/components/calculator/option-card';

// Service options with images and descriptions
const serviceOptions: Array<{
  value: ServiceType;
  label: string;
  description: string;
  icon: string;
  image?: string;
  placeholderClass: string;
}> = [
  {
    value: 'home',
    label: 'Home Removal',
    description: 'Moving house? We handle everything from studios to 5+ bed homes.',
    icon: '🏠',
    image: '/images/services/home-removal.webp',
    placeholderClass: 'img-placeholder-home',
  },
  {
    value: 'office',
    label: 'Office Removal',
    description: 'Relocating your business? Minimal downtime, maximum care.',
    icon: '🏢',
    image: '/images/services/office-removal.webp',
    placeholderClass: 'img-placeholder-office',
  },
  {
    value: 'clearance',
    label: 'Clearance Service',
    description: 'House clearance, rubbish removal, or end of tenancy clear-outs.',
    icon: '🗑️',
    image: '/images/services/clearance.webp',
    placeholderClass: 'img-placeholder-clearance',
  },
];

export function Step1ServiceType() {
  const state = useStore(calculatorStore);
  const selectedType = state.serviceType;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (type: ServiceType) => {
    setServiceType(type);

    // Visual feedback animation
    containerRef.current?.classList.add('auto-next-animate');

    // Auto-advance after short delay
    setTimeout(() => {
      containerRef.current?.classList.remove('auto-next-animate');

      // Clearance redirects to separate calculator
      if (type === 'clearance') {
        window.location.href = '/clearance-calculator';
        return;
      }

      // Otherwise proceed to next step
      nextStep();
    }, 200);
  };

  return (
    <div ref={containerRef} className="step-container space-y-6">
      {/* Header */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          What type of service do you need?
        </h1>
        <p className="text-muted-foreground mt-2">
          Select one to get started with your instant quote
        </p>
      </div>

      {/* Service Cards Grid */}
      <OptionCardGrid columns={3}>
        {serviceOptions.map((option) => (
          <OptionCard
            key={option.value}
            id={option.value}
            name="serviceType"
            label={option.label}
            isSelected={selectedType === option.value}
            onSelect={() => handleSelect(option.value)}
            icon={option.icon}
            image={option.image}
            placeholderClass={option.placeholderClass}
          />
        ))}
      </OptionCardGrid>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="text-emerald-500">✓</span> Free quote
        </span>
        <span className="flex items-center gap-1">
          <span className="text-emerald-500">✓</span> No obligation
        </span>
        <span className="flex items-center gap-1">
          <span className="text-emerald-500">✓</span> Takes 2 minutes
        </span>
      </div>
    </div>
  );
}

export default Step1ServiceType;
