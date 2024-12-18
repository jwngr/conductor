import {KeyboardShortcutsService} from '@shared/lib/shortcuts';

import {IS_MAC} from '@src/lib/environment.pwa';

export const keyboardShortcutsService = new KeyboardShortcutsService({isMac: IS_MAC});
