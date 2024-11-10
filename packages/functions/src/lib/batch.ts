import type {DocumentData, DocumentReference} from 'firebase-admin/firestore';

import {firestore} from '@src/lib/firebaseAdmin';

const BATCH_DELETE_SIZE = 500;

/**
 * Deletes a list of Firestore documents in batches.
 */
export async function batchDeleteFirestoreDocuments<T extends DocumentData>(
  refs: DocumentReference<T>[]
): Promise<void> {
  const totalBatches = Math.ceil(refs.length / BATCH_DELETE_SIZE);

  const batchedDeletePromises = Array.from({length: totalBatches}).map((_, i) => {
    const batch = firestore.batch();
    const batchRefs = refs.slice(i * BATCH_DELETE_SIZE, (i + 1) * BATCH_DELETE_SIZE);
    batchRefs.forEach((ref) => batch.delete(ref));
    return batch.commit();
  });

  await Promise.all(batchedDeletePromises);
}
