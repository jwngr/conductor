import type {CollectionReference, DocumentReference} from 'firebase/firestore';
import {addDoc, collection, doc, getDoc} from 'firebase/firestore';

import {asyncTry} from '@shared/lib/errorUtils.shared';

import type {ImportQueueItem, ImportQueueItemId} from '@shared/types/importQueue.types';
import {makeImportQueueItemId} from '@shared/types/importQueue.types';
import type {AsyncResult} from '@shared/types/result.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

export class ClientImportQueueService {
  private readonly importQueueDbRef: CollectionReference;

  constructor(args: {importQueueDbRef: CollectionReference}) {
    this.importQueueDbRef = args.importQueueDbRef;
  }

  async add(item: ImportQueueItem): AsyncResult<ImportQueueItemId> {
    const docRefResult = await asyncTry<DocumentReference>(async () => {
      return await addDoc(this.importQueueDbRef, item);
    });
    if (!docRefResult.success) return docRefResult;
    return makeImportQueueItemId(docRefResult.value.id);
  }

  async read(importQueueItemId: ImportQueueItemId): AsyncResult<ImportQueueItem | null> {
    return asyncTry<ImportQueueItem | null>(async () => {
      const docRef = doc(this.importQueueDbRef, importQueueItemId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      // TODO: Add typesafe `createImportQueueItem` helper.
      return {...docSnap.data(), importQueueItemId} as ImportQueueItem;
    });
  }
}

const importQueueDbRef = collection(firebaseService.firestore, 'importQueue');

export const importQueueService = new ClientImportQueueService({importQueueDbRef});
