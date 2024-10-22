export enum CustomIconType {
  Emoji = 'emoji',
  Icon = 'icon',
  UserFile = 'userFile',
}

interface EmojiCustomIcon {
  readonly type: CustomIconType.Emoji;
  readonly emoji: string;
}

interface IconCustomIcon {
  readonly type: CustomIconType.Icon;
  readonly iconName: string;
}

interface FileCustomIcon {
  readonly type: CustomIconType.UserFile;
  readonly srcUrl: string;
}

export type CustomIcon = EmojiCustomIcon | IconCustomIcon | FileCustomIcon;
