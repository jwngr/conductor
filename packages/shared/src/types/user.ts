import {User as FirebaseUser} from 'firebase/auth';

import {Consumer, Task} from '@shared/types/utils';

// TODO: Make usage of these more type safe.
export type UserId = string;
export type EmailAddress = string;

export interface LoggedInUser {
  readonly userId: UserId;
  readonly email: EmailAddress | null;
  readonly displayName: string | null;
  // readonly photoUrl: string;
}

export function makeLoggedInUserFromFirebaseUser(firebaseLoggedInUser: FirebaseUser): LoggedInUser {
  return {
    userId: firebaseLoggedInUser.uid,
    email: firebaseLoggedInUser.email,
    displayName: firebaseLoggedInUser.displayName,
  };
}

export type AuthStateChangedCallback = Consumer<LoggedInUser | null>;

export type AuthStateChangedUnsubscribe = Task;

export interface AuthService {
  getLoggedInUser: () => LoggedInUser | null;
  onAuthStateChanged: (callbacks: {
    successCallback: AuthStateChangedCallback;
    errorCallback: Consumer<Error>;
  }) => AuthStateChangedUnsubscribe;
}
