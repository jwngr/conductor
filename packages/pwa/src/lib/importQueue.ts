import {ImportQueue} from '@shared/lib/importQueue';
import {CollectionReference} from 'firebase/firestore/lite';

let importQueueSingleton: ImportQueue | null = null;

export function initImportQueue(collectionRef: CollectionReference): ImportQueue {
  if (!importQueueSingleton) {
    importQueueSingleton = new ImportQueue(collectionRef);
  }
  return importQueueSingleton;
}

export function getImportQueue() {
  if (!importQueueSingleton) {
    throw new Error('Import queue not initialized');
  }
  return importQueueSingleton;
}
