import {AuthService} from '@shared/lib/auth';

import {firebaseService} from '@sharedClient/lib/firebase.client';

export const authService = new AuthService(firebaseService.auth);
