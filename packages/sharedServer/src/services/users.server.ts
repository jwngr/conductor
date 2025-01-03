import type {AsyncResult} from '@shared/types/result.types';
import type {User, UserFromSchema, UserId} from '@shared/types/user.types';

import {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type UsersCollectionService = ServerFirestoreCollectionService<UserId, User, UserFromSchema>;

export class ServerUsersService {
  private readonly usersCollectionService: UsersCollectionService;

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
