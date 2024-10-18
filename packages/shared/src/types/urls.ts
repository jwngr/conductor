import {Params} from 'react-router-dom';

import {CustomIcon} from '@shared/lib/customIcon';

import {FeedItemId} from './core';
import {ViewType} from './query';

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
