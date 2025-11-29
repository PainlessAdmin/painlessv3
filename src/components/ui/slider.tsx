/**
 * SLIDER COMPONENT
 *
 * shadcn/ui style range slider
 */

import { cn } from '@/lib/utils';
import * as React from 'react';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const currentValue = value[0] ?? 0;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange?.([newValue]);
    };

    return (
      <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
        {/* Track background */}
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          {/* Filled track */}
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Native range input (for accessibility) */}
        <input
          type="range"
          ref={ref}
          value={currentValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            'absolute w-full h-2 opacity-0 cursor-pointer',
            'focus-visible:outline-none'
          )}
          {...props}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute h-5 w-5 rounded-full border-2 border-primary bg-background',
            'ring-offset-background transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            'shadow-md'
          )}
          style={{
            left: `calc(${percentage}% - 10px)`,
          }}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
