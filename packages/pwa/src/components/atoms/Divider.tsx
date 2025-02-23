import {type FC} from 'react';

interface DividerProps {
  readonly x?: number;
  readonly y?: number;
}

export const Divider: FC<DividerProps> = ({x, y}) => {
  const baseClasses = 'bg-neutral-400';

  // If both `x` and `y` are provided, create a box.
  if (x && y) {
    return <div className={`${baseClasses}`} style={{width: `${x}px`, height: `${y}px`}} />;
  }

  // If only `x` is provided, create a horizontal line.
  if (x) {
    return <div className={`${baseClasses} h-[1px]`} style={{width: `${x}px`}} />;
  }

  // If only `y` is provided, create a vertical line.
  if (y) {
    return <div className={`${baseClasses} w-[1px]`} style={{height: `${y}px`}} />;
  }

  // Default to a full-width horizontal line.
  return <div className={`${baseClasses} h-[1px] w-full`} />;
};
