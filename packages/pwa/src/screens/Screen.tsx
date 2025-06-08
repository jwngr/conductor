import type {FlexAlign, FlexGap, FlexJustify} from '@shared/types/flex.types';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import {AppHeader} from '@src/components/AppHeader';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {LeftSidebar} from '@src/components/nav/LeftSidebar';

import * as styles from '@src/screens/Screen.css';

interface ScreenProps extends WithChildren {
  readonly align?: FlexAlign;
  readonly justify?: FlexJustify;
  readonly gap?: FlexGap;
  readonly maxWidth?: number;
  readonly withHeader?: boolean;
  readonly withLeftSidebar?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  gap,
  align,
  justify,
  maxWidth,
  withHeader = false,
  withLeftSidebar = false,
}) => {
  return (
    <FlexColumn className={styles.screenWrapper}>
      {withHeader ? <AppHeader /> : null}
      <FlexRow flex align="stretch" overflow="auto">
        {withLeftSidebar ? <LeftSidebar /> : null}
        <FlexColumn
          flex
          overflow="auto"
          gap={gap}
          align={align}
          justify={justify}
          className={styles.screenMainContent}
          style={maxWidth ? {maxWidth, margin: '0 auto'} : undefined}
        >
          {children}
        </FlexColumn>
      </FlexRow>
    </FlexColumn>
  );
};
