/**
 * BUTTON COMPONENT
 *
 * DaisyUI style button with variants and microinteractions
 */

import { cn } from '@/lib/utils';
import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const baseStyles = 'btn transition-all duration-200 active:scale-95';

    const variants = {
      default: 'btn-primary',
      destructive: 'btn-error',
      outline: 'btn-outline btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      link: 'btn-link',
    };

    const sizes = {
      default: 'btn-md',
      sm: 'btn-sm',
      lg: 'btn-lg',
      icon: 'btn-square btn-md',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
