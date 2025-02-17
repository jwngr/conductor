import type {Params} from 'react-router-dom';

import type {CustomIcon} from '@shared/lib/customIcons.shared';
import {Urls} from '@shared/lib/urls.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {ViewType} from '@shared/types/query.types';

export interface FeedItemScreenParams extends Params {
  readonly feedItemId: FeedItemId;
}

export interface NavItem {
  readonly url: string;
  readonly icon: CustomIcon;
  readonly title: string;
}

export function makeNavItemForView(viewType: ViewType, args: Omit<NavItem, 'url'>): NavItem {
  return {
    url: Urls.forView(viewType),
    icon: args.icon,
    title: args.title,
  };
}
