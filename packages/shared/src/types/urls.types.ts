import type {Params} from 'react-router-dom';

import type {CustomIcon} from '@shared/lib/customIcons.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';

export interface FeedItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

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
}

export interface NavItem {
  readonly id: NavItemId;
  readonly url: string;
  readonly icon: CustomIcon;
  readonly title: string;
}
