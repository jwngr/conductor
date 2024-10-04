import {
  addDoc,
  CollectionReference,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

import {Func, SavedItem, Task} from '../types';

// TODO: This is currently not used, but the path I'd like to head...

export class ItemsService {
  constructor(private readonly collectionRef: CollectionReference) {}

  async watchAll(callback: Func<readonly SavedItem[]>): Promise<Task> {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      callback(snapshot.docs.map((doc) => doc.data() as SavedItem));
    });
    return unsubscribe;
  }

  async watch(callback: Func<SavedItem>): Promise<Task> {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        callback(doc.data() as SavedItem);
      });
    });
    return unsubscribe;
  }

  async add(item: SavedItem): Promise<string> {
    const docRef = await addDoc(this.collectionRef, item);
    return docRef.id;
  }

  async update(item: Partial<SavedItem>): Promise<void> {
    const copy = {...item};
    delete copy.id; // Don't persist IDs.
    return updateDoc(doc(this.collectionRef, item.id), copy);
  }

  async delete(itemId: string): Promise<void> {
    return deleteDoc(doc(this.collectionRef, itemId));
  }
}
