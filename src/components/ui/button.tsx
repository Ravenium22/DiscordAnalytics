// frontend/src/components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  className,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(
        'px-6 py-3 rounded-lg font-outfit font-semibold transition-all duration-200',
        {
          'bg-primary hover:bg-primary/90 text-white': variant === 'primary',
          'bg-accent hover:bg-accent/90 text-dark': variant === 'accent',
          'bg-secondary hover:bg-secondary/90 text-dark': variant === 'secondary',
          'border-2 border-primary text-primary hover:bg-primary hover:text-white': variant === 'outline',
          'hover:bg-white/10 text-white': variant === 'ghost',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };