import {Bug, Check, DotSquare, Inbox, Save, Star} from 'lucide-react';
import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import {IconName, type IconSize} from '@shared/types/icons.types';
import type {ThemeColor} from '@shared/types/theme.types';
import type {StyleAttributes} from '@shared/types/utils.types';

interface BaseIconProps extends StyleAttributes {
  readonly size: IconSize;
  readonly color?: ThemeColor;
}

export const DebugSaveExampleIcon: React.FC<BaseIconProps> = (props) => <Bug {...props} />;
export const InboxIcon: React.FC<BaseIconProps> = (props) => <Inbox {...props} />;
export const MarkDoneIcon: React.FC<BaseIconProps> = (props) => <Check {...props} />;
export const MarkUnreadIcon: React.FC<BaseIconProps> = (props) => <DotSquare {...props} />;
export const SaveIcon: React.FC<BaseIconProps> = (props) => <Save {...props} />;
export const StarIcon: React.FC<BaseIconProps> = (props) => <Star {...props} />;

interface UnifiedIconProps extends BaseIconProps {
  readonly name: IconName;
}

export const Icon: React.FC<UnifiedIconProps & {}> = ({name, ...props}) => {
  let IconComponent: React.ElementType;
  switch (name) {
    case IconName.DebugSaveExample:
      IconComponent = DebugSaveExampleIcon;
      break;
    case IconName.Inbox:
      IconComponent = InboxIcon;
      break;
    case IconName.MarkDone:
      IconComponent = MarkDoneIcon;
      break;
    case IconName.MarkUnread:
      IconComponent = MarkUnreadIcon;
      break;
    case IconName.Save:
      IconComponent = SaveIcon;
      break;
    case IconName.Star:
      IconComponent = StarIcon;
      break;
    default:
      assertNever(name);
  }

  return <IconComponent {...props} />;
};
