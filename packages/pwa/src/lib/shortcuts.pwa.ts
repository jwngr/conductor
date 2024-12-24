import {SharedKeyboardShortcutsService} from '@shared/services/keyboardShortcuts';

import {IS_MAC} from '@src/lib/environment.pwa';

export const keyboardShortcutsService = new SharedKeyboardShortcutsService({isMac: IS_MAC});
