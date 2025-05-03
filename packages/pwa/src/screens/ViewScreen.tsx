import type {ViewType} from '@shared/types/views.types';

import {FeedItemScreenKeyboardHandler} from '@src/components/feedItems/FeedItemScreenEscapeHandler';
import {ViewRenderer} from '@src/components/views/View';

import {Screen} from '@src/screens/Screen';

export const ViewScreen: React.FC<{
  readonly viewType: ViewType;
}> = ({viewType}) => {
  return (
    <Screen withHeader withLeftSidebar>
      <ViewRenderer key={viewType} viewType={viewType} />
      <FeedItemScreenKeyboardHandler />
    </Screen>
  );
};
