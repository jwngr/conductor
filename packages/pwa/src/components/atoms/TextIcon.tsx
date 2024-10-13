import React from 'react';
import styled from 'styled-components';

import InboxIcon from '@shared/icons/inbox.svg?react';
import MarkDoneIcon from '@shared/icons/markDone.svg?react';
import {assertNever} from '@shared/lib/utils';
import {StyleAttributes} from '@shared/types/core';
import {IconName, IconSize} from '@shared/types/icons';
import {ThemeColor} from '@shared/types/theme';

interface TextIconWrapperProps {
  readonly $color: ThemeColor;
  readonly $size: number;
}

const TextIconWrapper = styled.div<TextIconWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({$size}) => $size}px;
  height: ${({$size}) => $size}px;

  svg * {
    stroke: ${({theme, $color}) => theme.colors[$color]};
    fill: ${({theme, $color}) => theme.colors[$color]};
  }
`;

interface TextIconProps extends StyleAttributes {
  readonly name: IconName;
  readonly size: IconSize;
  readonly color?: ThemeColor;
}

export const TextIcon: React.FC<TextIconProps> = ({
  name,
  size,
  color = ThemeColor.Neutral900,
  ...styleProps
}) => {
  let IconComponent: React.ElementType;
  switch (name) {
    case IconName.MarkDone:
      IconComponent = MarkDoneIcon;
      break;
    case IconName.Inbox:
      IconComponent = InboxIcon;
      break;
    default:
      assertNever(name);
  }

  return (
    <TextIconWrapper $color={color} $size={size}>
      <IconComponent width={size} height={size} {...styleProps} />
    </TextIconWrapper>
  );
};
