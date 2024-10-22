import {OrderByDirection, WhereFilterOp} from 'firebase/firestore';

import {assertNever} from '@shared/lib/utils';

import {FeedItem} from './feedItems';

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

export interface View {
  readonly name: string;
  readonly type: ViewType;
  readonly filters: readonly Filter[];
  readonly sort: SortOption;
}

export enum FilterOp {
  Equals = '==',
  NotEquals = '!=',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
  Contains = 'array-contains',
  In = 'in',
  NotIn = 'not-in',
}

export interface Filter {
  readonly field: keyof FeedItem;
  readonly op: FilterOp;
  readonly value: unknown;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  readonly field: keyof FeedItem;
  readonly direction: SortDirection;
}

/**
 * Converters between Firestore types and internal types. This abstraction exists to provide a clear
 * boundary between the internal query language and the backing database layer (which may change).
 */
export function toSortDirection(direction: OrderByDirection): SortDirection {
  switch (direction) {
    case 'asc':
      return 'asc';
    case 'desc':
      return 'desc';
    default:
      assertNever(direction);
  }
}

export function fromSortDirection(direction: SortDirection): OrderByDirection {
  switch (direction) {
    case 'asc':
      return 'asc';
    case 'desc':
      return 'desc';
    default:
      assertNever(direction);
  }
}

export function toFilterOperator(op: WhereFilterOp): FilterOp {
  switch (op) {
    case '==':
      return FilterOp.Equals;
    case '!=':
      return FilterOp.NotEquals;
    case '>':
      return FilterOp.GreaterThan;
    case '>=':
      return FilterOp.GreaterThanOrEqual;
    case '<':
      return FilterOp.LessThan;
    case '<=':
      return FilterOp.LessThanOrEqual;
    case 'array-contains':
    case 'array-contains-any':
      return FilterOp.Contains;
    case 'in':
      return FilterOp.In;
    case 'not-in':
      return FilterOp.NotIn;
    default:
      assertNever(op);
  }
}

export function fromFilterOperator(op: FilterOp): WhereFilterOp {
  switch (op) {
    case FilterOp.Equals:
      return '==';
    case FilterOp.NotEquals:
      return '!=';
    case FilterOp.GreaterThan:
      return '>';
    case FilterOp.GreaterThanOrEqual:
      return '>=';
    case FilterOp.LessThan:
      return '<';
    case FilterOp.LessThanOrEqual:
      return '<=';
    case FilterOp.Contains:
      return 'array-contains';
    case FilterOp.In:
      return 'in';
    case FilterOp.NotIn:
      return 'not-in';
    default:
      assertNever(op);
  }
}
