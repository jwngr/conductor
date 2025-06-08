import {enableFirebaseTelemetry} from '@genkit-ai/firebase';
import admin from 'firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';
import type {Firestore} from 'firebase-admin/firestore';
import type {Storage} from 'firebase-admin/storage';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

export const serverTimestampSupplier = (): FieldValue => FieldValue.serverTimestamp();

enableFirebaseTelemetry({
  forceDevExport: false,
}).catch((error) => {
  logger.error(prefixError(error, 'Failed to enable Firebase telemetry'));
});

export class ServerFirebaseService {
  private storageInstance: Storage;
  private firestoreInstance: Firestore;

  constructor() {
    admin.initializeApp();

    this.storageInstance = admin.storage();

    this.firestoreInstance = admin.firestore();
    this.firestoreInstance.settings({ignoreUndefinedProperties: true});
  }

  public get storage(): Storage {
    return this.storageInstance;
  }

  public get firestore(): Firestore {
    return this.firestoreInstance;
  }
}
