import {AuthService} from '@shared/lib/auth';

import {firebaseService} from '@src/lib/firebase.pwa';

export const authService = new AuthService(firebaseService.auth);
