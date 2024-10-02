import {addDoc, CollectionReference, doc, getDoc} from 'firebase/firestore/lite';

import {ImportQueueItem} from '../types';

export class ImportQueue {
  constructor(private readonly collectionRef: CollectionReference) {}

  async add(item: ImportQueueItem): Promise<string> {
    const docRef = await addDoc(this.collectionRef, item);
    return docRef.id;
  }

  async read(id: string): Promise<ImportQueueItem | null> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as ImportQueueItem | null;
  }
}
