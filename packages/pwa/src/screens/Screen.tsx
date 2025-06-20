import type {FlexAlign, FlexGap, FlexJustify} from '@shared/types/flex.types';
import type {NavItemId} from '@shared/types/urls.types';

import type {WithChildren} from '@sharedClient/types/utils.client.types';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {TopBar} from '@src/components/TopBar';

import * as styles from '@src/screens/Screen.css';

interface ScreenProps extends WithChildren {
  readonly selectedNavItemId: NavItemId | null;
  readonly align?: FlexAlign;
  readonly justify?: FlexJustify;
  readonly gap?: FlexGap;
  readonly maxWidth?: number;
  readonly withHeader?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  gap,
  align,
  justify,
  maxWidth,
  selectedNavItemId,
  withHeader = false,
}) => {
  return (
    <FlexColumn className={styles.screenWrapper}>
      {withHeader ? <TopBar selectedNavItemId={selectedNavItemId} /> : null}
      <FlexRow flex align="stretch" overflow="auto">
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
