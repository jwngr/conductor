import {USERS_DB_COLLECTION} from '@shared/lib/constants';

import {UserId} from '@shared/types/user.types';

import {firestore} from '@src/lib/firebase';

/**
 * Hard-deletes a user document from Firestore.
 */
export async function deleteUsersDocForUser(userId: UserId): Promise<void> {
  await firestore.collection(USERS_DB_COLLECTION).doc(userId).delete();
}
