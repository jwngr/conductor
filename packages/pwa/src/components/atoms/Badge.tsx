import {cva, type VariantProps} from 'class-variance-authority';
import type React from 'react';

import {cn} from '@src/lib/utils.pwa';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-text-light hover:bg-primary/80',
        destructive: 'border-transparent bg-error text-text-light hover:bg-error/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({className, variant, ...props}) => {
  return <div className={cn(badgeVariants({variant}), className)} {...props} />;
};
