import type {Task} from '@shared/types/utils.types';

export enum ErrorScreenActionType {
  Refresh = 'REFRESH',
  DefaultRoute = 'DEFAULT_ROUTE',
  Custom = 'CUSTOM',
}

interface BaseErrorScreenAction {
  readonly type: ErrorScreenActionType;
}

interface RefreshErrorScreenAction extends BaseErrorScreenAction {
  readonly type: ErrorScreenActionType.Refresh;
}

export const REFRESH_ERROR_PAGE_ACTION: RefreshErrorScreenAction = {
  type: ErrorScreenActionType.Refresh,
};

interface DefaultRouteErrorScreenAction {
  readonly type: ErrorScreenActionType.DefaultRoute;
}

export const DEFAULT_ROUTE_ERROR_PAGE_ACTION: DefaultRouteErrorScreenAction = {
  type: ErrorScreenActionType.DefaultRoute,
};

interface CustomErrorScreenAction extends BaseErrorScreenAction {
  readonly type: ErrorScreenActionType.Custom;
  readonly text: string;
  // TODO: Use `buttonVariants`.
  readonly variant: 'default' | 'outline' | 'destructive';
  readonly onClick: Task;
}

export type ErrorScreenAction =
  | RefreshErrorScreenAction
  | DefaultRouteErrorScreenAction
  | CustomErrorScreenAction;
