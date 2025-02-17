import {useEffect} from 'react';

import {NavItems} from '@shared/lib/navItems.shared';

import type {ViewType} from '@shared/types/query.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {AppHeader} from '@src/components/AppHeader';
import {FeedItemScreenEscapeHandler} from '@src/components/feedItems/FeedItemScreenEscapeHandler';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';
import {View} from '@src/components/views/View';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  const {setFocusedNavItemId} = useFocusStore();

  useEffect(() => {
    setFocusedNavItemId(NavItems.forView(viewType).id);
  }, [viewType, setFocusedNavItemId]);

  return (
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        <View viewType={viewType} />
      </ScreenMainContentWrapper>
      <FeedItemScreenEscapeHandler />
    </ScreenWrapper>
  );
};
