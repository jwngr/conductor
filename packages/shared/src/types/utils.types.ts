export type Task = () => void;
export type Func<T, R> = (arg: T) => R;
export type Supplier<T> = () => T;
export type Consumer<T> = (arg: T) => void;

/** Unsubscribe function from a listener or subscription. */
export type Unsubscribe = Task;

/** Generic interface for all persisted items. */
export interface BaseStoreItem {
  readonly createdTime: Date;
  readonly lastUpdatedTime: Date;
}

export interface StyleAttributes {
  readonly style?: React.CSSProperties;
  readonly className?: string;
}

/** Strongly-typed type for a UUID. Prefer this over plain strings. */
export type UUID = string & {readonly __brand: 'UUIDBrand'};
