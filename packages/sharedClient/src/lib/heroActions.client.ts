import {HeroActionType} from '@sharedClient/types/heroActions.client.types';
import type {
  DefaultRouteHeroAction,
  RefreshHeroAction,
} from '@sharedClient/types/heroActions.client.types';

export const REFRESH_HERO_PAGE_ACTION: RefreshHeroAction = {
  type: HeroActionType.Refresh,
};

export const DEFAULT_ROUTE_HERO_PAGE_ACTION: DefaultRouteHeroAction = {
  type: HeroActionType.DefaultRoute,
};
