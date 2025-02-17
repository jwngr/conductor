import type React from 'react';
import styled from 'styled-components';

import type {IconName, IconSize} from '@shared/types/icons.types';
import {ThemeColor} from '@shared/types/theme.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import {Icon} from '@src/components/atoms/Icon';

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
  return (
    <TextIconWrapper $color={color} $size={size}>
      <Icon name={name} size={size} color={color} {...styleProps} />
    </TextIconWrapper>
  );
};
