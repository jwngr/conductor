import {ViewType} from '@shared/types/query.types';

import {AppHeader} from '@src/components/AppHeader';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';
import {View} from '@src/components/View';

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
    </ScreenWrapper>
  );
};
