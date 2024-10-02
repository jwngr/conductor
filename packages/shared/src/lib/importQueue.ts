import {firestore} from '@conductor/shared/lib/firebase';
import {ImportQueueItem} from '@conductor/shared/types';
import {addDoc, collection, doc, getDoc} from 'firebase/firestore/lite';

export async function addToImportQueue(item: ImportQueueItem): Promise<string> {
  const importQueueRef = collection(firestore, 'importQueue');
  const docRef = await addDoc(importQueueRef, item);
  return docRef.id;
}

export async function readFromImportQueue(id: string): Promise<ImportQueueItem | null> {
  const docRef = doc(firestore, 'importQueue', id);
  const docSnap = await getDoc(docRef);
  return docSnap.data() as ImportQueueItem | null;
}
