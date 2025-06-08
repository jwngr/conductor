import {ClientAuthService} from '@sharedClient/services/auth.client';

import {firebaseService} from '@src/lib/firebase.pwa';

export const authService = new ClientAuthService(firebaseService.auth);
