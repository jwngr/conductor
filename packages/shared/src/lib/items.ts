import {addDoc, CollectionReference, doc, getDoc} from 'firebase/firestore';

import {ImportQueueItem, SavedItem} from '../types';

export class Items {
  constructor(private readonly collectionRef: CollectionReference) {}

  async list(): Promise<readonly SavedItem[]> {
    const docRef = await getDocs(this.collectionRef);
    return docRef.docs.map((doc) => doc.data() as SavedItem);
  }

  async add(item: SavedItem): Promise<string> {
    const docRef = await addDoc(this.collectionRef, item);
    return docRef.id;
  }

  async read(id: string): Promise<ImportQueueItem | null> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as ImportQueueItem | null;
  }
}
