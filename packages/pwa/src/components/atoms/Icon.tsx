import {DynamicIcon} from 'lucide-react/dynamic';
import type {IconName as LucideIconName} from 'lucide-react/dynamic';
import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import type {IconSize} from '@shared/types/icons.types';
import {IconName} from '@shared/types/icons.types';
import type {StyleAttributes} from '@shared/types/utils.types';

interface BaseIconProps extends StyleAttributes {
  readonly size: IconSize;
}

interface UnifiedIconProps extends BaseIconProps {
  readonly name: IconName;
}

export const Icon: React.FC<UnifiedIconProps> = ({name, className, ...props}) => {
  return <DynamicIcon name={toLucideIconName(name)} className={className} {...props} />;
};

function toLucideIconName(name: IconName): LucideIconName {
  switch (name) {
    case IconName.Cancel:
      return 'x';
    case IconName.Debug:
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
    case IconName.RetryImport:
      return 'refresh-cw';
    case IconName.SlidersHorizontal:
      return 'sliders-horizontal';
    case IconName.ArrowUp:
      return 'arrow-up';
    case IconName.ArrowDown:
      return 'arrow-down';
    default:
      assertNever(name);
  }
}
