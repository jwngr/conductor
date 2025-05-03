import type {ViewType} from '@shared/types/views.types';

import {AppHeader} from '@src/components/AppHeader';
import {FeedItemScreenKeyboardHandler} from '@src/components/feedItems/FeedItemScreenEscapeHandler';
import {LeftSidebar} from '@src/components/nav/LeftSidebar';
import {ViewRenderer} from '@src/components/views/View';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <AppHeader />
      <div className="flex flex-1 items-stretch overflow-hidden">
        <LeftSidebar />
        <ViewRenderer key={viewType} viewType={viewType} />
      </div>
      <FeedItemScreenKeyboardHandler />
    </div>
  );
};
