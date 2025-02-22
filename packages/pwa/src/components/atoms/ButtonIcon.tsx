import type React from 'react';
import {useCallback} from 'react';
import styled from 'styled-components';

import {getIconSizeFromButtonIconSize} from '@shared/lib/icons.shared';

import type {ButtonIconSize, IconName} from '@shared/types/icons.types';
import type {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {ThemeColor} from '@shared/types/theme.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import type {MouseEvent} from '@sharedClient/types/utils.client.types';

import {Icon} from '@src/components/atoms/Icon';
import type {TooltipContent} from '@src/components/atoms/Tooltip';
import {Tooltip} from '@src/components/atoms/Tooltip';

import type {OnClick} from '@src/types/utils.pwa.types';

interface ButtonIconWrapperProps {
  readonly $color: ThemeColor;
  readonly $size: number;
}

const ButtonIconWrapper = styled.div<ButtonIconWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: ${({$size}) => $size}px;
  height: ${({$size}) => $size}px;
  border-radius: 4px;

  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  &:hover {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral200]};
  }

  svg * {
    stroke: ${({theme, $color}) => theme.colors[$color]};
  }
`;

interface ButtonIconProps extends StyleAttributes {
  readonly name: IconName;
  readonly size: ButtonIconSize;
  readonly color?: ThemeColor;
  readonly onClick: OnClick<HTMLDivElement>;
  readonly shortcutId?: KeyboardShortcutId;
  readonly tooltip: TooltipContent;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  name,
  tooltip,
  size: buttonIconSize,
  color = ThemeColor.Neutral900,
  onClick,
  shortcutId,
  ...styleProps
}) => {
  const iconSize = getIconSizeFromButtonIconSize(buttonIconSize);

  const handleShortcut = useCallback(() => {
    // TODO: Clean up this type.
    onClick?.(null as unknown as MouseEvent<HTMLDivElement>);
  }, [onClick]);

  const buttonIcon = (
    <ButtonIconWrapper $color={color} $size={buttonIconSize} onClick={onClick}>
      <Icon name={name} size={iconSize} color={color} {...styleProps} />
    </ButtonIconWrapper>
  );

  return (
    <Tooltip
      trigger={buttonIcon}
      content={tooltip}
      shortcutId={shortcutId}
      onShortcutTrigger={handleShortcut}
    />
  );
};
