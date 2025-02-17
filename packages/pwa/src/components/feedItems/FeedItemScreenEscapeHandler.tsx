import {NavItems} from '@shared/types/urls.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {keyboardShortcutsService, useNavShortcut} from '@src/lib/shortcuts.pwa';

export const FeedItemScreenEscapeHandler: React.FC = () => {
  const {focusedNavItemId} = useFocusStore();
  const focusedNavItem = NavItems.forId(focusedNavItemId);

  useNavShortcut(keyboardShortcutsService.forClose(), focusedNavItem.url);

  return null;
};
