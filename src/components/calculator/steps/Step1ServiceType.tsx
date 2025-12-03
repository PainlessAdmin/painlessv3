/**
 * STEP 1: SERVICE TYPE SELECTION
 *
 * User selects: Home Removal | Office Removal | Clearance Service
 * Uses DaisyUI cards with 1:1 images and microinteractions
 */

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setServiceType,
  nextStep,
  type ServiceType
} from '@/lib/calculator-store';
import { SelectionCard } from '@/components/ui/selection-card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';

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
    image: '/images/calculator/step1/home.svg',
  },
  {
    value: 'office',
    label: 'Office Removal',
    description: 'Relocating your business? Minimal downtime, maximum care.',
    image: '/images/calculator/step1/office.svg',
  },
  {
    value: 'clearance',
    label: 'Clearance Service',
    description: 'House clearance, rubbish removal, or end of tenancy clear-outs.',
    image: '/images/calculator/step1/clearance.svg',
  },
];

export function Step1ServiceType() {
  const state = useStore(calculatorStore);
  const [selectedType, setSelectedTypeLocal] = useState<ServiceType | null>(state.serviceType);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (type: ServiceType) => {
    // Clear any pending navigation timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }

    setSelectedTypeLocal(type);
    setServiceType(type);

    // Clearance redirects to separate calculator
    if (type === 'clearance') {
      window.location.href = '/clearance-calculator';
      return;
    }

    // Auto-next after selection
    navigationTimeoutRef.current = setTimeout(() => {
      navigationTimeoutRef.current = null;
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
    <div className="step-container">
      {/* Heading */}
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-semibold text-base-content">
          What type of service do you need?
        </h2>
        <p className="text-base-content/60 mt-2">
          Select one to get started with your instant quote
        </p>
      </div>

      {/* Service Cards - 2 columns on mobile, 3 on desktop */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        {serviceOptions.map((option, index) => (
          <div
            key={option.value}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <SelectionCard
              value={option.value}
              label={option.label}
              description={option.description}
              imageSrc={option.image}
              isSelected={selectedType === option.value}
              onSelect={() => handleSelect(option.value)}
            />
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-6 pt-2 animate-fade-in">
        <span className="trust-badge">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Free quote
        </span>
        <span className="trust-badge">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          No obligation
        </span>
        <span className="trust-badge">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Takes 2 minutes
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

export default Step1ServiceType;
