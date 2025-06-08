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
  Experiments = 'EXPERIMENTS',
}

export type ViewNavItemId = Exclude<
  NavItemId,
  NavItemId.Feeds | NavItemId.Import | NavItemId.Experiments
>;

export interface NavItem {
  readonly id: NavItemId;
  readonly icon: CustomIcon;
  readonly title: string;
}
