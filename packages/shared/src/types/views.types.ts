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
  readonly viewType: ViewType;
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

export enum ViewGroupByField {
  FeedSourceType = 'FEED_SOURCE_TYPE',
  FeedItemContentType = 'FEED_ITEM_CONTENT_TYPE',
  TriageStatus = 'TRIAGE_STATUS',
  ImportState = 'IMPORT_STATE',
  CreatedTime = 'CREATED_TIME',
  LastUpdatedTime = 'LAST_UPDATED_TIME',
}

export interface ViewGroupByOption {
  readonly field: ViewGroupByField;
}

export enum ViewSortByField {
  CreatedTime = 'CREATED_TIME',
  LastUpdatedTime = 'LAST_UPDATED_TIME',
  Title = 'TITLE',
}

export interface ViewSortByOption {
  readonly field: ViewSortByField;
  readonly direction: SortDirection;
}
