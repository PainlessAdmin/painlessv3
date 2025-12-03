/**
 * STEP 10B: FURNITURE DISASSEMBLY
 *
 * Allow users to select furniture items that need professional
 * disassembly and reassembly, with quantity inputs per category.
 */

import { useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  calculatorStore,
  setDisassemblyItems,
  nextStep,
  prevStep,
  type DisassemblyItem,
} from '@/lib/calculator-store';
import { CALCULATOR_CONFIG, type AssemblyComplexity } from '@/lib/calculator-config';
import { NavigationButtons } from '@/components/calculator/navigation-buttons';
import { cn } from '@/lib/utils';

// Category configuration with images
const CATEGORY_CONFIG: Record<AssemblyComplexity, {
  image: string;
  examples: string;
}> = {
  verySimple: {
    image: '/images/calculator/extras/table.svg',
    examples: 'Tables, TV stands, simple desks',
  },
  simple: {
    image: '/images/calculator/extras/frame-bed.svg',
    examples: 'Frame beds, bookshelves, IKEA furniture',
  },
  general: {
    image: '/images/calculator/extras/bunk-bed.svg',
    examples: 'Ottoman beds, cabin beds, bunk beds, double wardrobes',
  },
  complex: {
    image: '/images/calculator/extras/complex-furniture.svg',
    examples: 'Sliding-door wardrobes, mirrored units, grandfather clocks',
  },
  veryComplex: {
    image: '/images/calculator/extras/gym-equipment.svg',
    examples: 'Gym equipment, custom-made furniture, wall beds',
  },
};

// Format currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(price);
}

export function Step10bDisassembly() {
  const state = useStore(calculatorStore);

  // Initialize from store
  const [items, setItems] = useState<Map<AssemblyComplexity, number>>(() => {
    const map = new Map<AssemblyComplexity, number>();
    for (const item of state.extras.disassemblyItems || []) {
      map.set(item.category, item.quantity);
    }
    return map;
  });

  // Calculate total price
  const totalPrice = Array.from(items.entries()).reduce((sum, [category, qty]) => {
    return sum + CALCULATOR_CONFIG.assembly[category].price * qty;
  }, 0);

  // Toggle category selection
  const toggleCategory = (category: AssemblyComplexity) => {
    setItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(category)) {
        newMap.delete(category);
      } else {
        newMap.set(category, 1);
      }
      return newMap;
    });
  };

  // Update quantity
  const updateQuantity = (category: AssemblyComplexity, delta: number) => {
    setItems(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(category) || 1;
      const newQty = Math.max(1, Math.min(9, current + delta));
      newMap.set(category, newQty);
      return newMap;
    });
  };

  // Handle continue
  const handleContinue = () => {
    const disassemblyItems: DisassemblyItem[] = Array.from(items.entries()).map(
      ([category, quantity]) => ({ category, quantity })
    );
    setDisassemblyItems(disassemblyItems);
    nextStep();
  };

  // Check if valid (at least one item selected)
  const isValid = items.size > 0;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          Which furniture needs disassembly and reassembly?
        </h2>
        <p className="text-muted-foreground mt-2">
          Save time and avoid damage - our experts handle it safely
        </p>
      </div>

      {/* Upsell message */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Why professional assembly?</span> Avoid stripped screws,
          missing parts, and hours of frustration. We bring the right tools and expertise.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(CALCULATOR_CONFIG.assembly) as [AssemblyComplexity, typeof CALCULATOR_CONFIG.assembly.verySimple][]).map(
          ([category, config]) => {
            const isSelected = items.has(category);
            const quantity = items.get(category) || 0;
            const categoryConfig = CATEGORY_CONFIG[category];

            return (
              <DisassemblyCard
                key={category}
                category={category}
                label={config.label}
                examples={categoryConfig.examples}
                price={config.price}
                image={categoryConfig.image}
                isSelected={isSelected}
                quantity={quantity}
                onToggle={() => toggleCategory(category)}
                onQuantityChange={(delta) => updateQuantity(category, delta)}
              />
            );
          }
        )}
      </div>

      {/* Total */}
      {items.size > 0 && (
        <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
          <span className="text-foreground font-medium">Estimated total:</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
        </div>
      )}

      {/* Validation message */}
      {!isValid && (
        <p className="text-center text-sm text-muted-foreground">
          Select at least one furniture item to continue, or go back to remove this service
        </p>
      )}

      {/* Navigation */}
      <NavigationButtons
        onPrevious={prevStep}
        onNext={handleContinue}
        nextLabel="Continue"
        canGoNext={isValid}
      />
    </div>
  );
}

// Disassembly card component
interface DisassemblyCardProps {
  category: AssemblyComplexity;
  label: string;
  examples: string;
  price: number;
  image: string;
  isSelected: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantityChange: (delta: number) => void;
}

function DisassemblyCard({
  label,
  examples,
  price,
  image,
  isSelected,
  quantity,
  onToggle,
  onQuantityChange,
}: DisassemblyCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border-2 bg-card overflow-hidden',
        'transition-all duration-300 ease-out',
        'border-border shadow-sm',
        !isSelected && 'hover:border-primary/50 hover:shadow-lg',
        isSelected && [
          'border-primary bg-primary/5',
          'shadow-xl shadow-primary/10',
          'ring-2 ring-primary ring-offset-2 ring-offset-background',
        ]
      )}
    >
      {/* Quantity badge overlay */}
      {isSelected && quantity > 0 && (
        <div className="absolute top-2 left-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md">
          {quantity}
        </div>
      )}

      {/* Main clickable area */}
      <div
        className="cursor-pointer p-4"
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
      >
        {/* Image */}
        <div className="aspect-square w-full max-w-[120px] mx-auto mb-3">
          <img
            src={image}
            alt={label}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className={cn(
            'font-semibold transition-colors',
            isSelected ? 'text-primary' : 'text-foreground'
          )}>
            {label}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{examples}</p>
          <p className="text-primary font-semibold mt-2">{formatPrice(price)} per item</p>
        </div>
      </div>

      {/* Quantity controls - only show when selected */}
      {isSelected && (
        <div
          className="flex items-center justify-center gap-3 p-3 border-t border-border bg-muted/30"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onQuantityChange(-1)}
            disabled={quantity <= 1}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              'border-2 border-primary text-primary font-bold',
              'transition-all hover:bg-primary hover:text-primary-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary'
            )}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="text-lg font-bold text-foreground w-8 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(1)}
            disabled={quantity >= 9}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              'border-2 border-primary text-primary font-bold',
              'transition-all hover:bg-primary hover:text-primary-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary'
            )}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export default Step10bDisassembly;
