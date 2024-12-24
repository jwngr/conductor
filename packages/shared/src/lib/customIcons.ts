import {IconName} from '@shared/types/icons.types';

export enum CustomIconType {
  Emoji = 'emoji',
  Icon = 'icon',
  UserFile = 'userFile',
}

interface EmojiIcon {
  readonly type: CustomIconType.Emoji;
  readonly emoji: string;
}

interface SystemIcon {
  readonly type: CustomIconType.Icon;
  readonly iconName: IconName;
}

interface UserFileIcon {
  readonly type: CustomIconType.UserFile;
  readonly srcUrl: string;
}

export type CustomIcon = EmojiIcon | SystemIcon | UserFileIcon;

export const makeEmojiIcon = (emoji: string): EmojiIcon => {
  return {type: CustomIconType.Emoji, emoji};
};

export const makeSystemIcon = (iconName: IconName): SystemIcon => {
  return {type: CustomIconType.Icon, iconName};
};

export const makeUserFileIcon = (srcUrl: string): UserFileIcon => {
  return {type: CustomIconType.UserFile, srcUrl};
};
