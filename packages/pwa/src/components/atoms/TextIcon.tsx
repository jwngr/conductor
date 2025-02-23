import type React from 'react';

import type {IconName, IconSize} from '@shared/types/icons.types';
import {ThemeColor} from '@shared/types/theme.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import {Icon} from '@src/components/atoms/Icon';

import {getThemeColorClass} from '@src/lib/theme.pwa';

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
  const colorClass = getThemeColorClass(color);

  return (
    <div
      className={`flex items-center justify-center gap-[8px] ${colorClass} [&>svg]:stroke-current [&>svg>*]:fill-none [&>svg>*]:stroke-current`}
      style={{width: `${size}px`, height: `${size}px`}}
    >
      <Icon name={name} size={size} color={color} {...styleProps} />
    </div>
  );
};
