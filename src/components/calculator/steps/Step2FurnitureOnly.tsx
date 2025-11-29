/**
 * STEP 2B: FURNITURE ONLY FLOW
 *
 * Special flow for moving just furniture items.
 * All questions on one page:
 * - Item count
 * - 2-person items (size)
 * - Heavy items (>40kg)
 * - Specialist items (callback required)
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setFurnitureOnly,
  goToStep,
  prevStep,
  type FurnitureOnlyData,
} from '@/lib/calculator-store';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { StepNavigation } from '@/components/calculator/progress-bar-react';
import { cn } from '@/lib/utils';

// Specialist items list
const specialistItems = [
  { id: 'piano', label: 'Piano / Grand Piano', icon: '🎹' },
  { id: 'safe', label: 'Safe / Strongbox', icon: '🔐' },
  { id: 'gym-equipment', label: 'Heavy gym equipment', icon: '🏋️' },
  { id: 'hot-tub', label: 'Hot tub / Jacuzzi', icon: '🛁' },
  { id: 'marble-stone', label: 'Marble / Stone furniture', icon: '🪨' },
  { id: 'other', label: 'Other specialist item', icon: '📦' },
];

export function Step2FurnitureOnly() {
  const state = useStore(calculatorStore);

  // Local form state
  const [itemCount, setItemCount] = useState(state.furnitureOnly?.itemCount ?? 3);
  const [needs2Person, setNeeds2Person] = useState(state.furnitureOnly?.needs2Person ?? false);
  const [over40kg, setOver40kg] = useState(state.furnitureOnly?.over40kg ?? false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string[]>(
    state.furnitureOnly?.specialistItems ?? []
  );
  const [otherDescription, setOtherDescription] = useState(
    state.furnitureOnly?.otherSpecialistDescription ?? ''
  );

  // Check if specialist items selected (requires callback)
  const hasSpecialistItems = selectedSpecialist.length > 0 &&
    !selectedSpecialist.every(item => item === 'none');

  const handleSpecialistToggle = (itemId: string) => {
    setSelectedSpecialist(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  };

  const handleContinue = () => {
    // Save to store
    const data: FurnitureOnlyData = {
      itemCount,
      needs2Person,
      over40kg,
      specialistItems: selectedSpecialist.filter(s => s !== 'none'),
      otherSpecialistDescription: selectedSpecialist.includes('other') ? otherDescription : undefined,
    };

    setFurnitureOnly(data);

    // If specialist items → callback required, go to callback step
    if (hasSpecialistItems) {
      goToStep(12); // Final step shows callback request
      return;
    }

    // Otherwise skip to Step 5 (Date) - no belongings slider for furniture
    goToStep(5);
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <div className="step-container space-y-8">
      {/* Heading */}
      <div className="step-header text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary leading-tight">
          Tell us about your items
        </h1>
        <p className="text-muted-foreground mt-2">
          This helps us send the right team
        </p>
      </div>

      {/* Question 1: Item Count */}
      <div className="form-card p-6">
        <Label className="text-base font-medium">
          How many items need moving?
        </Label>

        <div className="mt-4 space-y-4">
          {/* Slider */}
          <Slider
            value={[itemCount]}
            onValueChange={(value) => setItemCount(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />

          {/* Labels */}
          <div className="flex justify-between text-sm text-muted-foreground px-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
            <span>8</span>
            <span>9</span>
            <span>10+</span>
          </div>

          {/* Current value display */}
          <div className="text-center">
            <span className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full">
              {itemCount === 10 ? '10+ items' : `${itemCount} item${itemCount > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* Question 2: 2-Person Items (Size) */}
      <div className="form-card p-6">
        <Label className="text-base font-medium">
          Do any items require 2 people due to SIZE?
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          e.g., sofa, desk, large wardrobe, bookshelf
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectionCard
            selected={!needs2Person}
            onClick={() => setNeeds2Person(false)}
            title="No"
            description="All items can be carried by one person"
          />
          <SelectionCard
            selected={needs2Person}
            onClick={() => setNeeds2Person(true)}
            title="Yes"
            description="At least one item needs two people"
          />
        </div>
      </div>

      {/* Question 3: Heavy Items (>40kg) */}
      <div className="form-card p-6">
        <Label className="text-base font-medium">
          Is any single item heavier than 40kg?
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          e.g., washing machine, heavy wooden furniture
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectionCard
            selected={!over40kg}
            onClick={() => setOver40kg(false)}
            title="No"
            description="Everything is under 40kg"
          />
          <SelectionCard
            selected={over40kg}
            onClick={() => setOver40kg(true)}
            title="Yes"
            description="At least one item is over 40kg"
          />
        </div>
      </div>

      {/* Question 4: Specialist Items */}
      <div className="form-card p-6">
        <Label className="text-base font-medium">
          Any SPECIALIST items requiring special handling?
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          These require special equipment and expertise
        </p>

        <div className="mt-4 space-y-3">
          {specialistItems.map((item) => (
            <div key={item.id}>
              <label
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedSpecialist.includes(item.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Checkbox
                  checked={selectedSpecialist.includes(item.id)}
                  onCheckedChange={() => handleSpecialistToggle(item.id)}
                />
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </label>

              {/* Other description field */}
              {item.id === 'other' && selectedSpecialist.includes('other') && (
                <div className="mt-2 ml-10">
                  <Input
                    placeholder="Please describe..."
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>
          ))}

          {/* None option */}
          <label
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              selectedSpecialist.length === 0
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <Checkbox
              checked={selectedSpecialist.length === 0}
              onCheckedChange={() => setSelectedSpecialist([])}
            />
            <span className="text-xl">✅</span>
            <span className="text-sm font-medium">None of these</span>
          </label>
        </div>
      </div>

      {/* Warning if specialist items selected */}
      {hasSpecialistItems && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertDescription className="text-amber-800">
            <strong>Specialist items require a custom quote.</strong>
            <br />
            We'll call you within 2 hours during business hours to discuss your requirements and provide an accurate quote.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <div className="form-card p-4 bg-muted/50">
        <div className="text-sm text-muted-foreground">
          <strong>Summary:</strong> {itemCount === 10 ? '10+' : itemCount} item{itemCount > 1 ? 's' : ''}
          {needs2Person && ' - Some need 2 people'}
          {over40kg && ' - Heavy items (40kg+)'}
          {hasSpecialistItems && ' - Specialist items'}
        </div>

        {!hasSpecialistItems && (
          <div className="mt-2 text-sm font-medium text-foreground">
            Estimated: {needs2Person || over40kg ? '2 movers' : '1 mover'}, 1 van
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <StepNavigation
        showBack={true}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel={hasSpecialistItems ? 'Request Callback' : 'Continue'}
      />
    </div>
  );
}

// ===================
// SUB-COMPONENTS
// ===================

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}

function SelectionCard({ selected, onClick, title, description }: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg border text-left transition-all',
        'hover:border-primary/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary'
          : 'border-border'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border-2',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}>
          {selected && (
            <span className="text-primary-foreground text-xs">✓</span>
          )}
        </div>
        <div>
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </button>
  );
}

export default Step2FurnitureOnly;
