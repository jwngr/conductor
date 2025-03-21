import type {StyleAttributes} from '@shared/types/utils.types';

import {useMedia} from '@sharedClient/hooks/media.hooks';

interface SpacerProps extends StyleAttributes {
  readonly x?: number | {readonly mobile?: number; readonly desktop?: number};
  readonly y?: number | {readonly mobile?: number; readonly desktop?: number};
  readonly flex?: number | string | boolean;
}

export const Spacer: React.FC<SpacerProps> = ({x, y, flex, style, ...rest}) => {
  const isDesktop = useMedia('(min-width: 768px)');
  const widthDesktop = typeof x === 'number' ? x : x?.desktop ? x.desktop : 0;
  const widthMobile = typeof x === 'number' ? x : x?.mobile ? x.mobile : 0;

  const heightDesktop = typeof y === 'number' ? y : y?.desktop ? y.desktop : 0;
  const heightMobile = typeof y === 'number' ? y : y?.mobile ? y.mobile : 0;

  const flexValue = flex === true ? 1 : flex === false ? 0 : flex;
  const width = isDesktop ? widthDesktop : widthMobile;
  const height = isDesktop ? heightDesktop : heightMobile;

  return (
    <div
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        flex: flexValue,
        ...style,
      }}
      {...rest}
    >
      &nbsp;
    </div>
  );
};
