import type React from 'react';

import type {CustomFileIcon, EmojiIcon, SystemIcon} from '@shared/lib/customIcons.shared';
import {CustomIconType} from '@shared/lib/customIcons.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {IconSize} from '@shared/types/icons.types';

import {TextIcon} from '@src/components/atoms/TextIcon';

export const CustomIcon: React.FC<{
  readonly icon: EmojiIcon | SystemIcon | CustomFileIcon;
  readonly size: IconSize;
}> = ({size, icon}) => {
  switch (icon.type) {
    case CustomIconType.Emoji:
      return <div style={{fontSize: size}}>{icon.emoji}</div>;
    case CustomIconType.Icon:
      return <TextIcon name={icon.iconName} size={size} />;
    case CustomIconType.CustomFile:
      return (
        <img src={icon.srcUrl} alt="Custom uploaded image" style={{width: size, height: size}} />
      );
    default:
      assertNever(icon);
  }
};
