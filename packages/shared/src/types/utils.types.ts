export type Task = () => void;
export type Supplier<T> = () => T;
export type Consumer<T> = (arg: T) => void;
export type AsyncTask = () => Promise<void>;
export type AsyncSupplier<T> = () => Promise<T>;
export type AsyncConsumer<T> = (arg: T) => Promise<void>;
export type Func2<A, B> = (arg1: A, arg2: B) => void;
export type Func3<A, B, C> = (arg1: A, arg2: B, arg3: C) => void;

export interface StyleAttributes {
  readonly style?: React.CSSProperties;
  readonly className?: string;
}
