import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React, {useEffect} from 'react';

import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import type {Supplier} from '@shared/types/utils.types';

import {FlexRow} from '@src/components/atoms/Flex';
import {P, Span} from '@src/components/atoms/Text';

import {keyboardShortcutsService} from '@src/lib/shortcuts.pwa';
import {cn} from '@src/lib/utils.pwa';

export const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRootComponent = TooltipPrimitive.Root;

const TooltipTriggerComponent = TooltipPrimitive.Trigger;

const TooltipContentComponent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({sideOffset = 4, className, ...props}, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'border-neutral-3 bg-neutral-5 text-neutral-1 z-50 overflow-hidden rounded border px-2 py-1',
      className
    )}
    {...props}
  />
));

TooltipContentComponent.displayName = TooltipPrimitive.Content.displayName;

interface SimpleTooltipContent {
  readonly text: string;
}

export type TooltipContent = React.ReactElement | string | SimpleTooltipContent;

interface TooltipProps extends TooltipPrimitive.TooltipProps {
  readonly trigger: React.ReactNode;
  readonly content: TooltipContent;
  readonly shortcutId?: KeyboardShortcutId;
  readonly onShortcutTrigger?: Supplier<Promise<void>>;
}

export const Tooltip: React.FC<TooltipProps> = ({
  trigger,
  content,
  shortcutId,
  onShortcutTrigger,
  ...tooltipProps
}) => {
  const shortcut = shortcutId ? keyboardShortcutsService.getShortcut(shortcutId) : undefined;

  useEffect(() => {
    if (!shortcut || !onShortcutTrigger) return;
    return keyboardShortcutsService.registerShortcut(shortcut, onShortcutTrigger);
  }, [onShortcutTrigger, shortcut]);

  let tooltipContent: React.ReactNode;
  if (typeof content === 'string') {
    tooltipContent = <P>{content}</P>;
  } else if ('text' in content) {
    tooltipContent = <P>{content.text}</P>;
  } else {
    tooltipContent = content;
  }

  let shortcutKeysContent: React.ReactNode;
  if (shortcut) {
    shortcutKeysContent = shortcut.displayKeys.map((key) => <Span key={key}>{key}</Span>);
  }

  return (
    <TooltipRootComponent {...tooltipProps}>
      <TooltipTriggerComponent>{trigger}</TooltipTriggerComponent>
      <TooltipContentComponent>
        <FlexRow gap={4}>
          {tooltipContent}
          {shortcutKeysContent}
        </FlexRow>
      </TooltipContentComponent>
    </TooltipRootComponent>
  );
};
