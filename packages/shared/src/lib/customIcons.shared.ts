import type {IconName} from '@shared/types/icons.types';

export enum CustomIconType {
  Emoji = 'EMOJI',
  Icon = 'ICON',
  CustomFile = 'CUSTOM_FILE',
}

interface EmojiIcon {
  readonly type: CustomIconType.Emoji;
  readonly emoji: string;
}

interface SystemIcon {
  readonly type: CustomIconType.Icon;
  readonly iconName: IconName;
}

interface CustomFileIcon {
  readonly type: CustomIconType.CustomFile;
  readonly srcUrl: string;
}

export type CustomIcon = EmojiIcon | SystemIcon | CustomFileIcon;

export const makeEmojiIcon = (emoji: string): EmojiIcon => {
  return {type: CustomIconType.Emoji, emoji};
};

export const makeSystemIcon = (iconName: IconName): SystemIcon => {
  return {type: CustomIconType.Icon, iconName};
};

export const makeCustomFileIcon = (srcUrl: string): CustomFileIcon => {
  return {type: CustomIconType.CustomFile, srcUrl};
};
