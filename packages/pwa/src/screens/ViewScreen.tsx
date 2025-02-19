import type {ViewType} from '@shared/types/query.types';

import {AppHeader} from '@src/components/AppHeader';
import {FeedItemScreenKeyboardHandler} from '@src/components/feedItems/FeedItemScreenEscapeHandler';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';
import {View} from '@src/components/views/View';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  return (
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        <View viewType={viewType} />
      </ScreenMainContentWrapper>
      <FeedItemScreenKeyboardHandler />
    </ScreenWrapper>
  );
};
