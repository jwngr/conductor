import {useCallback, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {Urls} from '@shared/lib/urls.shared';

import {ViewType} from '@shared/types/query.types';

import {useFocusStore} from '@sharedClient/stores/FocusStore';

import {keyboardShortcutsService} from '@src/lib/shortcuts.pwa';

export const FeedItemScreenEscapeHandler: React.FC = () => {
  const navigate = useNavigate();
  const {focusedViewType} = useFocusStore();

  const handleEscape = useCallback(() => {
    // Navigate back to the parent view, if any. Otherwise, navigate to Untriaged.
    navigate(Urls.forView(focusedViewType ?? ViewType.Untriaged));
  }, [navigate, focusedViewType]);

  useEffect(() => {
    const shortcut = keyboardShortcutsService.forClose();
    return keyboardShortcutsService.registerShortcut(shortcut, handleEscape);
  }, [handleEscape]);

  return null;
};
