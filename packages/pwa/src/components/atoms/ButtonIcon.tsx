import React, {MouseEventHandler} from 'react';
import styled from 'styled-components';

import InboxIcon from '@shared/icons/inbox.svg?react';
import MarkDoneIcon from '@shared/icons/markDone.svg?react';
import SaveIcon from '@shared/icons/save.svg?react';
import {getIconSizeFromButtonIconSize} from '@shared/lib/icons';
import {assertNever} from '@shared/lib/utils';
import {StyleAttributes} from '@shared/types/core';
import {ButtonIconSize, IconName} from '@shared/types/icons';
import {ThemeColor} from '@shared/types/theme';

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
  readonly onClick?: MouseEventHandler<HTMLDivElement>;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  name,
  size: buttonIconSize,
  color = ThemeColor.Neutral900,
  onClick,
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
    default:
      assertNever(name);
  }

  const iconSize = getIconSizeFromButtonIconSize(buttonIconSize);

  return (
    <ButtonIconWrapper $color={color} $size={buttonIconSize} onClick={onClick}>
      <IconComponent width={iconSize} height={iconSize} {...styleProps} />
    </ButtonIconWrapper>
  );
};
