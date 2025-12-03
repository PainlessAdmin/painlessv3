/**
 * SELECTION CARD COMPONENT
 *
 * Reusable card component for selection-based UI with:
 * - 1:1 aspect ratio images (max 220px)
 * - Microinteractions (hover lift, scale, image zoom)
 * - Animated check indicator
 * - Auto-next functionality support
 */

import { cn } from '@/lib/utils';
import * as React from 'react';

interface SelectionCardProps {
  /** Unique identifier for the card */
  value: string;
  /** Title displayed below the image */
  title: string;
  /** Image source (webp with jpeg/svg fallback) */
  imageSrc?: string;
  /** Fallback image source */
  fallbackSrc?: string;
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Click handler */
  onSelect?: () => void;
  /** Additional className for the card */
  className?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Optional badge text (e.g., "Better prices!") */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'success' | 'warning';
}

const SelectionCard = React.forwardRef<HTMLDivElement, SelectionCardProps>(
  (
    {
      value,
      title,
      imageSrc,
      fallbackSrc,
      isSelected = false,
      onSelect,
      className,
      disabled = false,
      badge,
      badgeVariant = 'default',
    },
    ref
  ) => {
    const [imgError, setImgError] = React.useState(false);

    const handleImageError = () => {
      if (fallbackSrc && !imgError) {
        setImgError(true);
      }
    };

    const currentImageSrc = imgError && fallbackSrc ? fallbackSrc : imageSrc;

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative cursor-pointer rounded-xl border-2 bg-card text-card-foreground',
          'transition-all duration-300 ease-out',
          // Default state
          'border-border shadow-sm',
          // Hover state (not selected)
          !isSelected && !disabled && [
            'hover:-translate-y-1 hover:scale-[1.02]',
            'hover:border-primary/50 hover:shadow-lg',
          ],
          // Selected state
          isSelected && [
            '-translate-y-1.5 scale-[1.03]',
            'border-primary bg-primary/5',
            'shadow-xl shadow-primary/10',
            'ring-2 ring-primary ring-offset-2 ring-offset-background',
          ],
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className
        )}
        onClick={disabled ? undefined : onSelect}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect?.();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-pressed={isSelected}
        aria-disabled={disabled}
        data-value={value}
      >
        {/* Selected check indicator with bounce animation */}
        <div
          className={cn(
            'absolute -top-2 -right-2 z-10',
            'flex h-6 w-6 items-center justify-center rounded-full',
            'bg-primary text-primary-foreground text-xs font-bold',
            'shadow-md',
            'transition-all duration-300',
            isSelected
              ? 'scale-100 opacity-100 animate-bounce-once'
              : 'scale-0 opacity-0'
          )}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Image container - 1:1 aspect ratio */}
        <div className="relative aspect-square w-full max-w-[220px] mx-auto overflow-hidden rounded-t-lg">
          {currentImageSrc ? (
            <img
              src={currentImageSrc}
              alt={title}
              onError={handleImageError}
              className={cn(
                'h-full w-full object-contain p-4',
                'transition-transform duration-300 ease-out',
                // Image zoom on hover/select
                (isSelected || !disabled) && 'group-hover:scale-110',
                isSelected && 'scale-105'
              )}
              loading="lazy"
            />
          ) : (
            // Placeholder if no image
            <div className="h-full w-full flex items-center justify-center bg-muted/30">
              <div className="text-4xl text-muted-foreground/50">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="p-3 pt-2 text-center">
          <h3
            className={cn(
              'font-semibold text-sm transition-colors duration-200',
              isSelected ? 'text-primary' : 'text-foreground'
            )}
          >
            {title}
          </h3>
        </div>

        {/* Optional badge */}
        {badge && (
          <div
            className={cn(
              'absolute -bottom-2 left-1/2 -translate-x-1/2',
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
              'text-xs font-medium whitespace-nowrap',
              'transition-all duration-200',
              badgeVariant === 'success' && 'bg-emerald-100 text-emerald-700',
              badgeVariant === 'warning' && 'bg-amber-100 text-amber-700',
              badgeVariant === 'default' && 'bg-primary/10 text-primary'
            )}
          >
            {badge}
          </div>
        )}
      </div>
    );
  }
);

SelectionCard.displayName = 'SelectionCard';

/**
 * Container for SelectionCards that ensures consistent layout
 * - Cards always centered
 * - Same height in each row
 */
interface SelectionCardGridProps {
  children: React.ReactNode;
  /** Number of columns on different breakpoints */
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  className?: string;
}

function SelectionCardGrid({
  children,
  columns = { default: 2, sm: 2, md: 3, lg: 3 },
  className,
}: SelectionCardGridProps) {
  const gridCols = cn(
    columns.default === 1 && 'grid-cols-1',
    columns.default === 2 && 'grid-cols-2',
    columns.default === 3 && 'grid-cols-3',
    columns.sm === 2 && 'sm:grid-cols-2',
    columns.sm === 3 && 'sm:grid-cols-3',
    columns.md === 3 && 'md:grid-cols-3',
    columns.md === 4 && 'md:grid-cols-4',
    columns.lg === 3 && 'lg:grid-cols-3',
    columns.lg === 4 && 'lg:grid-cols-4'
  );

  return (
    <div
      className={cn(
        'grid gap-4 justify-center',
        'auto-rows-fr', // Ensures same height in each row
        gridCols,
        className
      )}
    >
      {children}
    </div>
  );
}

export { SelectionCard, SelectionCardGrid };
export type { SelectionCardProps, SelectionCardGridProps };
