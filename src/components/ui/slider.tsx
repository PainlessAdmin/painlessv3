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
      <div className={cn('relative flex w-full select-none items-center h-8', className)}>
        {/* Track background */}
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary pointer-events-none">
          {/* Filled track */}
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb (visual only) */}
        <div
          className={cn(
            'absolute h-6 w-6 rounded-full border-2 border-primary bg-background',
            'ring-offset-background',
            'shadow-md pointer-events-none'
          )}
          style={{
            left: `calc(${percentage}% - 12px)`,
          }}
        />

        {/* Native range input (interactive layer on top) */}
        <input
          type="range"
          ref={ref}
          value={currentValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          style={{ touchAction: 'none' }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
