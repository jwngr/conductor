import type React from 'react';

import type {IconName, IconSize} from '@shared/types/icons.types';
import {DEFAULT_ICON_COLOR} from '@shared/types/theme.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import {FlexRow} from '@src/components/atoms/Flex';
import {Icon} from '@src/components/atoms/Icon';

import {cn} from '@src/lib/utils.pwa';

interface TextIconProps extends StyleAttributes {
  readonly name: IconName;
  readonly size: IconSize;
}

export const TextIcon: React.FC<TextIconProps> = ({name, size, style, className}) => {
  return (
    <FlexRow align="center" justify="center" style={{width: `${size}px`, height: `${size}px`}}>
      <Icon className={cn(DEFAULT_ICON_COLOR, className)} name={name} size={size} style={style} />
    </FlexRow>
  );
};
