import {deleteFirestoreDoc} from '@sharedServer/lib/firebase.server';

import {USERS_DB_COLLECTION} from '@shared/lib/constants';

import {AsyncResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

/**
 * Hard-deletes a user document from Firestore.
 */
export async function deleteUsersDocForUser(userId: UserId): AsyncResult<void> {
  return deleteFirestoreDoc(`${USERS_DB_COLLECTION}/${userId}`);
}
