/**
 * OPTION CARD COMPONENT
 *
 * Reusable image-based selection card with radio/checkbox behavior
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface OptionCardProps {
  /** Unique identifier for the option */
  id: string;
  /** Group name for radio behavior */
  name: string;
  /** Display label */
  label: string;
  /** Optional description text */
  description?: string;
  /** Whether this option is selected */
  isSelected: boolean;
  /** Selection handler */
  onSelect: () => void;
  /** Optional image URL */
  image?: string;
  /** Fallback emoji/icon if no image */
  icon?: string;
  /** CSS class for placeholder background gradient */
  placeholderClass?: string;
  /** Whether to show as checkbox (multi-select) vs radio (single-select) */
  type?: 'radio' | 'checkbox';
  /** Additional className for the container */
  className?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  id,
  name,
  label,
  description,
  isSelected,
  onSelect,
  image,
  icon,
  placeholderClass = 'img-placeholder-property',
  type = 'radio',
  className,
  disabled = false,
}) => {
  const inputId = `${name}-${id}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div className={cn('option-card', className)}>
      <input
        type={type}
        name={name}
        id={inputId}
        value={id}
        checked={isSelected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className={cn(
          'block cursor-pointer rounded-2xl transition-all duration-300',
          'hover:shadow-lg border-2 border-transparent h-full overflow-hidden relative',
          isSelected && 'shadow-xl border-primary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          background: isSelected
            ? 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
            : '#e1e8f1',
        }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Image or Placeholder */}
        <div className="relative">
          {image ? (
            <img
              src={image}
              alt={label}
              className="w-full aspect-square object-cover rounded-t-xl"
              loading="lazy"
            />
          ) : (
            <div className={cn('img-placeholder', placeholderClass)}>
              {icon && <span className="text-white drop-shadow-lg">{icon}</span>}
            </div>
          )}

          {/* Gradient Overlay with Label */}
          <div
            className="absolute bottom-0 left-0 right-0 py-3 px-2 option-card-overlay"
          >
            <h3 className="font-semibold text-base md:text-lg text-center text-white drop-shadow-md">
              {label}
            </h3>
          </div>
        </div>

        {/* Description (optional, shown below image) */}
        {description && (
          <div className="p-3 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        )}

        {/* Checkmark Indicator */}
        <div
          className={cn(
            'option-card-checkmark',
            isSelected && 'opacity-100 scale-100'
          )}
        >
          ✓
        </div>
      </label>
    </div>
  );
};

/**
 * OPTION CARD GRID
 *
 * Responsive grid container for option cards
 */
export interface OptionCardGridProps {
  /** Number of columns (2-4) */
  columns?: 2 | 3 | 4;
  /** Grid items */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

export const OptionCardGrid: React.FC<OptionCardGridProps> = ({
  columns = 3,
  children,
  className,
}) => {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-4 md:gap-6 mb-8',
        gridClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * SIMPLE OPTION CARD (no image)
 *
 * For yes/no questions or simple selections
 */
export interface SimpleOptionCardProps {
  id: string;
  name: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onSelect: () => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

export const SimpleOptionCard: React.FC<SimpleOptionCardProps> = ({
  id,
  name,
  label,
  description,
  isSelected,
  onSelect,
  icon,
  className,
  disabled = false,
}) => {
  const inputId = `${name}-${id}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div className={cn('option-card', className)}>
      <input
        type="radio"
        name={name}
        id={inputId}
        value={id}
        checked={isSelected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className={cn(
          'block cursor-pointer rounded-2xl transition-all duration-300 p-6',
          'hover:shadow-lg border-2 border-transparent h-full',
          'flex flex-col items-center justify-center text-center gap-3',
          isSelected && 'shadow-xl border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          background: isSelected
            ? 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.08) 100%)'
            : '#e1e8f1',
        }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Icon */}
        {icon && (
          <span className="text-4xl md:text-5xl">{icon}</span>
        )}

        {/* Label */}
        <h3 className="font-semibold text-lg text-foreground">
          {label}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div className="flex justify-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
              ✓
            </span>
          </div>
        )}
      </label>
    </div>
  );
};

export default OptionCard;
