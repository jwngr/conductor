import {AuthService} from '@shared/lib/auth';

import {firebaseService} from '@src/lib/firebase.ext';

export const authService = new AuthService(firebaseService.auth);
