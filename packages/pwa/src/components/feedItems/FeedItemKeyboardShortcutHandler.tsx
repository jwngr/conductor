import {useNavigate} from '@tanstack/react-router';
import {useCallback, useMemo} from 'react';

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

  const feedItemShortcuts: ShortcutWithHandler[] = useMemo(() => {
    const shortcuts = [
      {
        shortcut: keyboardShortcutsService.forClose(),
        handler: handleClose,
      },
    ];
    return shortcuts;
  }, [handleClose]);

  useShortcuts(feedItemShortcuts);

  return null;
};
