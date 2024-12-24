import {CollectionReference} from 'firebase-admin/firestore';

import type {AsyncResult} from '@shared/types/result.types';
import type {UserId} from '@shared/types/user.types';

import {deleteFirestoreDoc} from '@sharedServer/lib/firebase.server';

export class ServerUsersService {
  private usersDbRef: CollectionReference;

  constructor(args: {readonly usersDbRef: CollectionReference}) {
    this.usersDbRef = args.usersDbRef;
  }

  /**
   * Permanently deletes a user document from Firestore.
   */
  public async deleteUsersDocForUser(userId: UserId): AsyncResult<void> {
    return deleteFirestoreDoc(this.usersDbRef.doc(userId));
  }
}
