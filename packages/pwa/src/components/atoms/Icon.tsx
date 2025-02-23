import {DynamicIcon} from 'lucide-react/dynamic';
import type {IconName as LucideIconName} from 'lucide-react/dynamic';
import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import type {IconSize} from '@shared/types/icons.types';
import {IconName} from '@shared/types/icons.types';
import {ThemeColor} from '@shared/types/theme.types';
import type {StyleAttributes} from '@shared/types/utils.types';

import {getThemeColorClass} from '@src/lib/theme.pwa';
import {cn} from '@src/lib/utils';

interface BaseIconProps extends StyleAttributes {
  readonly size: IconSize;
  readonly color?: ThemeColor;
}

interface UnifiedIconProps extends BaseIconProps {
  readonly name: IconName;
}

export const Icon: React.FC<UnifiedIconProps> = ({
  name,
  color = ThemeColor.Neutral900,
  className,
  ...props
}) => {
  return (
    <DynamicIcon
      name={toLucideIconName(name)}
      className={cn(className, getThemeColorClass(color))}
      {...props}
    />
  );
};

function toLucideIconName(name: IconName): LucideIconName {
  switch (name) {
    case IconName.Cancel:
      return 'x';
    case IconName.DebugSaveExample:
      return 'bug';
    case IconName.Inbox:
      return 'inbox';
    case IconName.MarkDone:
      return 'check';
    case IconName.MarkUnread:
      return 'dot-square';
    case IconName.Save:
      return 'save';
    case IconName.Star:
      return 'star';
    default:
      assertNever(name);
  }
}
