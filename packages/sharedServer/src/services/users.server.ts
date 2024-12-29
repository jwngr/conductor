import {User} from 'firebase/auth';

import type {AsyncResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';

import {FirebaseCollectionService} from '@sharedServer/lib/firebase.server';

type UsersCollectionService = FirebaseCollectionService<UserId, User>;

export class ServerUsersService {
  private usersCollectionService: UsersCollectionService;

  constructor(args: {readonly usersCollectionService: UsersCollectionService}) {
    this.usersCollectionService = args.usersCollectionService;
  }

  /**
   * Permanently deletes a user document from Firestore.
   */
  public async deleteUsersDocForUser(userId: UserId): AsyncResult<void> {
    return this.usersCollectionService.deleteDoc(userId);
  }
}
