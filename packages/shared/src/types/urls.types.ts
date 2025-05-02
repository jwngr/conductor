import type {CustomIcon} from '@shared/lib/customIcons.shared';

export enum NavItemId {
  Untriaged = 'UNTRIAGED',
  Saved = 'SAVED',
  Done = 'DONE',
  Unread = 'UNREAD',
  Starred = 'STARRED',
  All = 'ALL',
  Today = 'TODAY',
  Trashed = 'TRASHED',
  Feeds = 'FEEDS',
  Import = 'IMPORT',
}

export interface NavItem {
  readonly id: NavItemId;
  readonly url: string;
  readonly icon: CustomIcon;
  readonly title: string;
}
