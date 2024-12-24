import type {Params} from 'react-router-dom';

import type {CustomIcon} from '@shared/lib/customIcons';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';

export interface FeedItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

export interface NavItem {
  readonly icon: CustomIcon;
  readonly title: string;
  readonly viewType: ViewType;
}
