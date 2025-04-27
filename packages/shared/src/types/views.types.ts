import type {QueryFilterOp, SortDirection} from '@shared/types/query.types';

export enum ViewType {
  Untriaged = 'UNTRIAGED',
  Saved = 'SAVED',
  Done = 'DONE',
  Trashed = 'TRASHED',
  Unread = 'UNREAD',
  Starred = 'STARRED',
  All = 'ALL',
  Today = 'TODAY',
}

export interface View<T> {
  readonly name: string;
  readonly type: ViewType;
  readonly sortBy: readonly ViewSortByOption[];
  readonly groupBy: readonly ViewGroupByOption[];
  // TODO: Consider moving to a separate abstraction since this is about data fetching.
  readonly filters: ReadonlyArray<ViewFilter<T>>;
}

interface ViewFilter<T> {
  readonly field: keyof T;
  readonly op: QueryFilterOp;
  readonly value: unknown;
}

export type ViewGroupByField = 'type' | 'importState';

export interface ViewGroupByOption {
  readonly field: ViewGroupByField;
}

export type ViewSortByField = 'createdTime' | 'lastUpdatedTime' | 'title';

export interface ViewSortByOption {
  readonly field: ViewSortByField;
  readonly direction: SortDirection;
}

export const SORT_BY_CREATED_TIME_DESC_OPTION: ViewSortByOption = {
  field: 'createdTime',
  direction: 'desc',
};

export const SORT_BY_LAST_UPDATED_TIME_DESC_OPTION: ViewSortByOption = {
  field: 'lastUpdatedTime',
  direction: 'desc',
};
