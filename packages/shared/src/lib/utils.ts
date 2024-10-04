export const formatWithCommas = (val: number): string => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}

export function filterNull<T>(arr: (T | null)[]): T[] {
  return arr.filter(Boolean) as T[];
}

export function filterUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(Boolean) as T[];
}

export function mapNull<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function mapUndefined<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}
