import {assertNever} from '@shared/lib/utils.shared';

// TODO: Ideally we would use the types directly from Firebase, but we are in shared code and cannot
// import from either client or server.
type FirebaseOrderByDirection = 'asc' | 'desc';

type FirebaseWhereFilterOp =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in';

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
  readonly filters: ReadonlyArray<Filter<T>>;
  readonly sort: SortOption<T>;
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

interface Filter<T> {
  readonly field: keyof T;
  readonly op: FilterOp;
  readonly value: unknown;
}

type SortDirection = 'asc' | 'desc';

interface SortOption<T> {
  readonly field: keyof T;
  readonly direction: SortDirection;
}

/**
 * Converters between Firestore types and internal types. This abstraction exists to provide a clear
 * boundary between the internal query language and the backing database layer (which may change).
 */
export function toSortDirection(direction: FirebaseOrderByDirection): SortDirection {
  switch (direction) {
    case 'asc':
      return 'asc';
    case 'desc':
      return 'desc';
    default:
      assertNever(direction);
  }
}

export function fromSortDirection(direction: SortDirection): FirebaseOrderByDirection {
  switch (direction) {
    case 'asc':
      return 'asc';
    case 'desc':
      return 'desc';
    default:
      assertNever(direction);
  }
}

export function toFilterOperator(op: FirebaseWhereFilterOp): FilterOp {
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

export function fromFilterOperator(op: FilterOp): FirebaseWhereFilterOp {
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
