import * as styles from '@src/components/atoms/Dot.css';

export const Dot: React.FC<{
  readonly size: number;
  // TODO: Update this to use a theme color.
  readonly color: string;
}> = ({size, color}) => {
  return (
    <div
      className={styles.dot}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  );
};
