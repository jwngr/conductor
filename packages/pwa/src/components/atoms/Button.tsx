import {Slot} from '@radix-ui/react-slot';
import {cva} from 'class-variance-authority';
import type {VariantProps} from 'class-variance-authority';
import type React from 'react';

import {cn} from '@src/lib/utils.pwa';

export const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-30 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-error text-error-foreground shadow-xs hover:bg-error/90 focus-visible:ring-error/20 dark:focus-visible:ring-error/40',
        outline:
          'border text-foreground border-neutral-2 bg-background shadow-xs hover:bg-neutral-1',
        ghost: 'text-foreground hover:bg-neutral-1',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const Button: React.FC<
  React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {asChild?: boolean}
> = ({className, variant, size, asChild = false, ...props}) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
};
