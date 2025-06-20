import type {IconName} from '@shared/types/icons.types';

export enum CustomIconType {
  Emoji = 'EMOJI',
  Icon = 'ICON',
  CustomFile = 'CUSTOM_FILE',
}

export interface EmojiIcon {
  readonly type: CustomIconType.Emoji;
  readonly emoji: string;
}

export interface SystemIcon {
  readonly type: CustomIconType.Icon;
  readonly iconName: IconName;
}

export interface CustomFileIcon {
  readonly type: CustomIconType.CustomFile;
  readonly srcUrl: string;
}

export const makeEmojiIcon = (emoji: string): EmojiIcon => {
  return {type: CustomIconType.Emoji, emoji};
};

export const makeSystemIcon = (iconName: IconName): SystemIcon => {
  return {type: CustomIconType.Icon, iconName};
};

export const makeCustomFileIcon = (srcUrl: string): CustomFileIcon => {
  return {type: CustomIconType.CustomFile, srcUrl};
};
