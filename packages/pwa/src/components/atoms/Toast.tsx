import * as ToastPrimitives from '@radix-ui/react-toast';
import type React from 'react';
import {forwardRef} from 'react';

import {theme} from '@shared/lib/theme.shared';

import {ThemeColor} from '@shared/types/theme.types';

import {CancelIcon} from '@src/components/atoms/Icon';

export const ToastProvider = ToastPrimitives.Provider;

const TOAST_DURATION_MS = 7_000;

// TODO: Improve visual design of toasts.

export const ToastViewport = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({className, ...props}, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={className}
    style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 100,
    }}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

export const Toast = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({className, ...props}, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={className}
      duration={TOAST_DURATION_MS}
      style={{
        border: `1px solid ${theme.colors[ThemeColor.Neutral500]}`,
        backgroundColor: theme.colors[ThemeColor.Neutral200],
        padding: 16,
        minWidth: 320,
        maxWidth: 480,
      }}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

export const ToastAction = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({className, ...props}, ref) => (
  <ToastPrimitives.Action ref={ref} className={className} {...props} />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

export const ToastClose = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({className, ...props}, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={className}
    style={{
      position: 'absolute',
      right: 16,
      top: 16,
    }}
    toast-close=""
    {...props}
  >
    <CancelIcon size={16} />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export const ToastTitle = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({className, ...props}, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={className}
    style={{
      fontSize: '14px',
      fontWeight: 'bold',
    }}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

export const ToastDescription = forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({className, ...props}, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={className}
    style={{
      fontSize: '12px',
      opacity: 0.9,
    }}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

export type ToastActionElement = React.ReactElement<typeof ToastAction>;
