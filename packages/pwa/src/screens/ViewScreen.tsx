import {useEffect} from 'react';

import type {ViewType} from '@shared/types/query.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {AppHeader} from '@src/components/AppHeader';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';
import {View} from '@src/components/views/View';
import {ViewScreenEscapeHandler} from '@src/components/views/ViewScreenEscapeHandler';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  const {setFocusedViewType} = useFocusStore();

  useEffect(() => {
    setFocusedViewType(viewType);
  }, [viewType, setFocusedViewType]);

  return (
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        <View viewType={viewType} />
      </ScreenMainContentWrapper>
      <ViewScreenEscapeHandler />
    </ScreenWrapper>
  );
};
