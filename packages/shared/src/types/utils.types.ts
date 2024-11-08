export type Task = () => void;
export type Func<T, R> = (arg: T) => R;
export type Supplier<T> = () => T;
export type Consumer<T> = (arg: T) => void;
export type AsyncTask = () => Promise<void>;
export type AsyncFunc<T, R> = (arg: T) => Promise<R>;
export type AsyncSupplier<T> = () => Promise<T>;
export type AsyncConsumer<T> = (arg: T) => Promise<void>;

export interface StyleAttributes {
  readonly style?: React.CSSProperties;
  readonly className?: string;
}
