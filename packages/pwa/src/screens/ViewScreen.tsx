import type {ViewType} from '@shared/types/query.types';

import {AppHeader} from '@src/components/AppHeader';
import {FeedItemScreenKeyboardHandler} from '@src/components/feedItems/FeedItemScreenEscapeHandler';
import {LeftSidebar} from '@src/components/LeftSidebar';
import {View} from '@src/components/views/View';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <AppHeader />
      <div className="flex flex-1 items-stretch overflow-hidden">
        <LeftSidebar />
        <View viewType={viewType} />
      </div>
      <FeedItemScreenKeyboardHandler />
    </div>
  );
};
