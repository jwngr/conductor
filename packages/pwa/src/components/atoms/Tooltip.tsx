import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React, {useEffect} from 'react';
import styled from 'styled-components';

import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {ThemeColor} from '@shared/types/theme.types';
import type {Task} from '@shared/types/utils.types';

import {FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

import {keyboardShortcutsService} from '@src/lib/shortcuts.pwa';

export const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRootComponent = TooltipPrimitive.Root;

const TooltipTriggerComponent = TooltipPrimitive.Trigger;

const TooltipContentComponentWrapper = styled(TooltipPrimitive.Content)`
  z-index: 50;
  overflow: hidden;
  border-radius: 4px;
  color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral900]};
  border: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral500]};
  padding: 4px 8px;
  // TODO: Add subtle slide-in animation.
`;

const TooltipContentComponent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({sideOffset = 4, ...props}, ref) => (
  <TooltipContentComponentWrapper ref={ref} sideOffset={sideOffset} {...props} />
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
  readonly onShortcutTrigger?: Task;
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

    keyboardShortcutsService.registerShortcut(shortcut, onShortcutTrigger);

    return () => {
      keyboardShortcutsService.unregisterShortcut(shortcut.shortcutId);
    };
  }, [onShortcutTrigger, shortcut]);

  let tooltipContent: React.ReactNode;
  if (typeof content === 'string') {
    tooltipContent = <Text as="p">{content}</Text>;
  } else if ('text' in content) {
    tooltipContent = <Text as="p">{content.text}</Text>;
  } else {
    tooltipContent = content;
  }

  let shortcutKeysContent: React.ReactNode;
  if (shortcut) {
    shortcutKeysContent = shortcut.displayKeys.map((key) => (
      <Text as="span" key={key}>
        {key}
      </Text>
    ));
  }

  return (
    <TooltipRootComponent {...tooltipProps}>
      <TooltipTriggerComponent>{trigger}</TooltipTriggerComponent>
      <TooltipContentComponent>
        <FlexRow gap={8}>
          {tooltipContent}
          {shortcutKeysContent}
        </FlexRow>
      </TooltipContentComponent>
    </TooltipRootComponent>
  );
};
