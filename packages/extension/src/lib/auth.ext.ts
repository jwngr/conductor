import {ClientAuthService} from '@sharedClient/services/auth.client';

import {firebaseService} from '@src/lib/firebase.ext';

export const authService = new ClientAuthService(firebaseService.auth);
