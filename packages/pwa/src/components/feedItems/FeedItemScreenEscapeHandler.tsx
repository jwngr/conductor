import {Urls} from '@shared/lib/urls.shared';

import {ViewType} from '@shared/types/query.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {keyboardShortcutsService, useNavShortcut} from '@src/lib/shortcuts.pwa';

export const FeedItemScreenEscapeHandler: React.FC = () => {
  const {focusedViewType} = useFocusStore();

  // Navigate back to the parent view, if any. Otherwise, navigate to Untriaged.
  useNavShortcut(
    keyboardShortcutsService.forClose(),
    Urls.forView(focusedViewType ?? ViewType.Untriaged)
  );

  return null;
};
