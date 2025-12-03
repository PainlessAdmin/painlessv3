/**
 * SELECTION CARD COMPONENT
 *
 * DaisyUI-based card for multi-choice selection with:
 * - 1:1 aspect ratio images (webp with jpeg fallback)
 * - Microinteractions (hover zoom, scale, shadow)
 * - Selected state keeps elevated/zoomed
 * - Animated check indicator
 */

import { cn } from '@/lib/utils';
import * as React from 'react';

interface SelectionCardProps {
  /** Unique identifier for the option */
  value: string;
  /** Display label */
  label: string;
  /** Optional description (hidden on mobile) */
  description?: string;
  /** Image source - provide base path without extension for webp/jpeg fallback */
  imageSrc: string;
  /** Whether this card is currently selected */
  isSelected: boolean;
  /** Click handler */
  onSelect: () => void;
  /** Optional additional class names */
  className?: string;
}

export function SelectionCard({
  value,
  label,
  description,
  imageSrc,
  isSelected,
  onSelect,
  className,
}: SelectionCardProps) {
  // Determine if imageSrc is SVG or needs picture element
  const isSvg = imageSrc.endsWith('.svg');

  return (
    <div
      className={cn(
        'selection-card relative rounded-xl',
        isSelected && 'selection-card-selected',
        className
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
      {/* Selected check indicator */}
      {isSelected && (
        <div className="check-indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Image container - 1:1 aspect ratio */}
      <figure className="selection-card-image">
        {isSvg ? (
          <img
            src={imageSrc}
            alt={label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <picture>
            <source srcSet={`${imageSrc}.webp`} type="image/webp" />
            <source srcSet={`${imageSrc}.jpg`} type="image/jpeg" />
            <img
              src={`${imageSrc}.jpg`}
              alt={label}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </picture>
        )}
      </figure>

      {/* Card body */}
      <div className="card-body p-3 sm:p-4">
        <h3 className="card-title text-sm sm:text-base text-base-content justify-center text-center">
          {label}
        </h3>
        {description && (
          <p className="text-xs text-base-content/60 text-center hidden sm:block">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * SIMPLE SELECTION CARD (without image)
 * For options like "None of these" or icon-based selections
 */
interface SimpleSelectionCardProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
  badge?: string;
}

export function SimpleSelectionCard({
  label,
  description,
  icon,
  isSelected,
  onSelect,
  className,
  badge,
}: SimpleSelectionCardProps) {
  return (
    <div
      className={cn(
        'selection-card relative rounded-xl p-4',
        isSelected && 'selection-card-selected',
        className
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
      {/* Selected check indicator */}
      {isSelected && (
        <div className="check-indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-2">
        {/* Icon */}
        {icon && <div className="text-3xl">{icon}</div>}

        {/* Label */}
        <h3 className="font-semibold text-sm text-base-content">{label}</h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-base-content/60">{description}</p>
        )}

        {/* Badge */}
        {badge && isSelected && (
          <span className="badge badge-warning badge-sm">{badge}</span>
        )}
      </div>
    </div>
  );
}

export default SelectionCard;
