/**
 * STEP 1: SERVICE TYPE SELECTION
 *
 * User selects: Home Removal | Office Removal | Clearance Service
 */

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setServiceType,
  nextStep,
  type ServiceType
} from '@/lib/calculator-store';
import { SelectionCard, SelectionCardGrid } from '@/components/ui/selection-card';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';

// Service options with images
const serviceOptions: Array<{
  value: ServiceType;
  label: string;
  image: string;
}> = [
  {
    value: 'home',
    label: 'Home Removal',
    image: '/images/calculator/home-removal.svg',
  },
  {
    value: 'office',
    label: 'Office Removal',
    image: '/images/calculator/office-removal.svg',
  },
  {
    value: 'clearance',
    label: 'Clearance Service',
    image: '/images/calculator/clearance.svg',
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
      <SelectionCardGrid columns={{ default: 2, sm: 3 }}>
        {serviceOptions.map((option) => (
          <SelectionCard
            key={option.value}
            value={option.value}
            title={option.label}
            imageSrc={option.image}
            isSelected={selectedType === option.value}
            onSelect={() => handleSelect(option.value)}
          />
        ))}
      </SelectionCardGrid>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-6 pt-2 text-sm font-medium">
        <span className="flex items-center gap-1.5" style={{ color: '#035349' }}>
          <span className="text-base">✓</span> Free quote
        </span>
        <span className="flex items-center gap-1.5" style={{ color: '#035349' }}>
          <span className="text-base">✓</span> No obligation
        </span>
        <span className="flex items-center gap-1.5" style={{ color: '#035349' }}>
          <span className="text-base">✓</span> Takes 2 minutes
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
