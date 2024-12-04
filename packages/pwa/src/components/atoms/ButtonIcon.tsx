import React from 'react';
import styled from 'styled-components';

import {getIconSizeFromButtonIconSize} from '@shared/lib/icons';
import {assertNever} from '@shared/lib/utils';

import {ButtonIconSize, IconName} from '@shared/types/icons.types';
import {KeyboardShortcut} from '@shared/types/shortcuts.types';
import {ThemeColor} from '@shared/types/theme.types';
import {StyleAttributes} from '@shared/types/utils.types';

import InboxIcon from '@shared/icons/inbox.svg?react';
import MarkDoneIcon from '@shared/icons/markDone.svg?react';
import MarkUnreadIcon from '@shared/icons/markUnread.svg?react';
import SaveIcon from '@shared/icons/save.svg?react';
import StarIcon from '@shared/icons/star.svg?react';

import {Tooltip, TooltipContent} from '@src/components/atoms/Tooltip';

import {OnClick} from '@src/types/utils.pwa.types';

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
    fill: ${({theme, $color}) => theme.colors[$color]};
  }
`;

interface ButtonIconProps extends StyleAttributes {
  readonly name: IconName;
  readonly size: ButtonIconSize;
  readonly color?: ThemeColor;
  readonly onClick?: OnClick<HTMLDivElement>;
  readonly shortcut?: KeyboardShortcut;
  readonly tooltip: TooltipContent;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  name,
  tooltip,
  size: buttonIconSize,
  color = ThemeColor.Neutral900,
  onClick,
  shortcut,
  ...styleProps
}) => {
  let IconComponent: React.ElementType;
  switch (name) {
    case IconName.MarkDone:
      IconComponent = MarkDoneIcon;
      break;
    case IconName.Save:
      IconComponent = SaveIcon;
      break;
    case IconName.Inbox:
      IconComponent = InboxIcon;
      break;
    case IconName.MarkUnread:
      IconComponent = MarkUnreadIcon;
      break;
    case IconName.Star:
      IconComponent = StarIcon;
      break;
    default:
      assertNever(name);
  }

  const iconSize = getIconSizeFromButtonIconSize(buttonIconSize);

  const handleShortcut = React.useCallback(() => {
    // TODO: Clean up this type.
    onClick?.(null as unknown as React.MouseEvent<HTMLDivElement>);
  }, [onClick]);

  const buttonIcon = (
    <ButtonIconWrapper $color={color} $size={buttonIconSize} onClick={onClick}>
      <IconComponent width={iconSize} height={iconSize} {...styleProps} />
    </ButtonIconWrapper>
  );

  return (
    <Tooltip
      trigger={buttonIcon}
      content={tooltip}
      shortcut={shortcut}
      onShortcutTrigger={onClick ? handleShortcut : undefined}
    />
  );
};
