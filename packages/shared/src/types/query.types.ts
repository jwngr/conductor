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

export enum QueryFilterOp {
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

export function toQueryFilterOp(op: FirebaseWhereFilterOp): QueryFilterOp {
  switch (op) {
    case '==':
      return QueryFilterOp.Equals;
    case '!=':
      return QueryFilterOp.NotEquals;
    case '>':
      return QueryFilterOp.GreaterThan;
    case '>=':
      return QueryFilterOp.GreaterThanOrEqual;
    case '<':
      return QueryFilterOp.LessThan;
    case '<=':
      return QueryFilterOp.LessThanOrEqual;
    case 'array-contains':
    case 'array-contains-any':
      return QueryFilterOp.Contains;
    case 'in':
      return QueryFilterOp.In;
    case 'not-in':
      return QueryFilterOp.NotIn;
    default:
      assertNever(op);
  }
}

export function fromQueryFilterOp(op: QueryFilterOp): FirebaseWhereFilterOp {
  switch (op) {
    case QueryFilterOp.Equals:
      return '==';
    case QueryFilterOp.NotEquals:
      return '!=';
    case QueryFilterOp.GreaterThan:
      return '>';
    case QueryFilterOp.GreaterThanOrEqual:
      return '>=';
    case QueryFilterOp.LessThan:
      return '<';
    case QueryFilterOp.LessThanOrEqual:
      return '<=';
    case QueryFilterOp.Contains:
      return 'array-contains';
    case QueryFilterOp.In:
      return 'in';
    case QueryFilterOp.NotIn:
      return 'not-in';
    default:
      assertNever(op);
  }
}

export type SortDirection = 'asc' | 'desc';

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
