export type Task<T = void> = () => T;
export type AsyncTask<T = void> = () => Promise<T>;
export type Func<A> = (arg1: A) => void;
export type Func2<A, B> = (arg1: A, arg2: B) => void;
export type Func3<A, B, C> = (arg1: A, arg2: B, arg3: C) => void;

export interface StyleAttributes {
  readonly style?: React.CSSProperties;
  readonly className?: string;
}
