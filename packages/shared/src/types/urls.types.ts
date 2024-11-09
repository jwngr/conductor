import {Params} from 'react-router-dom';

import {CustomIcon} from '@shared/lib/customIcons';

import {FeedItemId} from '@shared/types/feedItems.types';
import {ViewType} from '@shared/types/query.types';

export interface FeedItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

export interface NavItem {
  readonly icon: CustomIcon;
  readonly title: string;
  readonly viewType: ViewType;
}
