import {useCallback, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {Urls} from '@shared/lib/urls.shared';

import {ViewType} from '@shared/types/query.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';

import {keyboardShortcutsService} from '@src/lib/shortcuts.pwa';

export const ViewScreenEscapeHandler: React.FC = () => {
  const navigate = useNavigate();

  const handleEscape = useCallback(() => {
    // Default to the Untriaged view if there's no source view
    navigate(Urls.forView(ViewType.Untriaged));
  }, [navigate]);

  useEffect(() => {
    const shortcut = keyboardShortcutsService.forClose();
    keyboardShortcutsService.registerShortcut(shortcut, handleEscape);

    return () => {
      keyboardShortcutsService.unregisterShortcut(KeyboardShortcutId.Close);
    };
  }, [handleEscape]);

  return null;
};
