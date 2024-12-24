import {SharedAuthService} from '@shared/services/auth';

import {firebaseService} from '@sharedClient/services/firebase.client';

export const authService = new SharedAuthService(firebaseService.auth);
