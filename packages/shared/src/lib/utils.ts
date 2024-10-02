export const formatWithCommas = (val: number): string => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}
