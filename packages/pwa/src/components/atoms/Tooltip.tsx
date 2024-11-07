import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';
import styled from 'styled-components';

import {ThemeColor} from '@shared/types/theme';

import {Text} from '@src/components/atoms/Text';

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
  // TODO: Add keyboard shortcuts.
  // readonly shortcutId: KeyboardShortcut;
}

export type TooltipContent = React.ReactElement | string | SimpleTooltipContent;

interface TooltipProps extends TooltipPrimitive.TooltipProps {
  readonly trigger: React.ReactNode;
  readonly content: TooltipContent;
}

export const Tooltip: React.FC<TooltipProps> = ({trigger, content, ...tooltipProps}) => {
  let tooltipContent: React.ReactNode;
  if (typeof content === 'string') {
    tooltipContent = <Text as="p">{content}</Text>;
  } else if ('text' in content) {
    tooltipContent = <Text as="p">{content.text}</Text>;
  } else {
    tooltipContent = content;
  }

  return (
    <TooltipRootComponent {...tooltipProps}>
      <TooltipTriggerComponent>{trigger}</TooltipTriggerComponent>
      <TooltipContentComponent>{tooltipContent}</TooltipContentComponent>
    </TooltipRootComponent>
  );
};
