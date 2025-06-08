import type {Task} from '@shared/types/utils.types';

export enum HeroActionType {
  Refresh = 'REFRESH',
  DefaultRoute = 'DEFAULT_ROUTE',
  Custom = 'CUSTOM',
}

interface BaseHeroAction {
  readonly type: HeroActionType;
}

export interface RefreshHeroAction extends BaseHeroAction {
  readonly type: HeroActionType.Refresh;
}

export interface DefaultRouteHeroAction extends BaseHeroAction {
  readonly type: HeroActionType.DefaultRoute;
}

export interface CustomHeroAction extends BaseHeroAction {
  readonly type: HeroActionType.Custom;
  readonly text: string;
  // TODO: Use `buttonVariants`.
  readonly variant: 'default' | 'outline' | 'destructive';
  readonly onClick: Task;
}

export type HeroAction = RefreshHeroAction | DefaultRouteHeroAction | CustomHeroAction;
