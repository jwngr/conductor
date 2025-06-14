import {useNavigate} from '@tanstack/react-router';
import {useCallback} from 'react';

import {filterNull} from '@shared/lib/utils.shared';

import type {ShortcutWithHandler} from '@shared/types/shortcuts.types';

import {keyboardShortcutsService, useShortcuts} from '@src/lib/shortcuts.pwa';

import type {ViewRoute} from '@src/routes';

export const FeedItemKeyboardShortcutHandler: React.FC<{
  readonly currentRoute: ViewRoute;
}> = ({currentRoute}) => {
  const navigate = useNavigate();

  const handleClose = useCallback(async () => {
    await navigate({
      to: currentRoute.to,
      search: (prev) => ({...prev, feedItemId: undefined}),
    });
  }, [navigate, currentRoute]);

  const feedItemShortcuts: ShortcutWithHandler[] = filterNull([
    {
      shortcut: keyboardShortcutsService.forClose(),
      handler: handleClose,
    },
  ]);

  useShortcuts(feedItemShortcuts);

  return null;
};
