import {type FC} from 'react';

import * as styles from '@src/components/atoms/Divider.css';

interface DividerProps {
  readonly x?: number;
  readonly y?: number;
}

export const Divider: FC<DividerProps> = ({x, y}) => {
  // If both `x` and `y` are provided, create a box.
  if (x && y) {
    return <div className={styles.divider} style={{width: `${x}px`, height: `${y}px`}} />;
  }

  // If only `x` is provided, create a horizontal line.
  if (x) {
    return <div className={styles.divider} style={{width: `${x}px`, height: '1px'}} />;
  }

  // If only `y` is provided, create a vertical line.
  if (y) {
    return <div className={styles.divider} style={{height: `${y}px`, width: '1px'}} />;
  }

  // Default to a full-width horizontal line.
  return <div className={styles.divider} style={{height: '1px', width: '100%'}} />;
};
