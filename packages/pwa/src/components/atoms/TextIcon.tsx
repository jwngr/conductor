import type React from 'react';

import type {IconName, IconSize} from '@shared/types/icons.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import {Icon} from '@src/components/atoms/Icon';

import {cn} from '@src/lib/utils.pwa';

interface TextIconProps extends StyleAttributes {
  readonly name: IconName;
  readonly size: IconSize;
}

const DEFAULT_ICON_COLOR = 'text-text';

export const TextIcon: React.FC<TextIconProps> = ({name, size, style, className}) => {
  return (
    <div
      className="flex items-center justify-center gap-[8px] [&>svg]:stroke-current [&>svg>*]:fill-none [&>svg>*]:stroke-current"
      style={{width: `${size}px`, height: `${size}px`}}
    >
      <Icon className={cn(DEFAULT_ICON_COLOR, className)} name={name} size={size} style={style} />
    </div>
  );
};
