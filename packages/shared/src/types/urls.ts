import {Params} from 'react-router-dom';

import {CustomIcon} from '@shared/lib/customIcons';
import {FeedItemId} from '@shared/types/feedItems';
import {ViewType} from '@shared/types/query';

/**
 * Enum representing the top-level paths in the application.
 * Use these constants when defining routes or constructing URLs.
 */
export enum TopLevelPath {
  FeedItem = '/items/',
  Saved = '/saved',
  Done = '/done',
  All = '/all',
  Starred = '/starred',
  Unread = '/unread',
}

export interface FeedItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

export interface NavItem {
  readonly icon: CustomIcon;
  readonly title: string;
  readonly viewType: ViewType;
}
