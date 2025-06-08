import {enableFirebaseTelemetry} from '@genkit-ai/firebase';
import admin from 'firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';
import type {Firestore} from 'firebase-admin/firestore';
import type {Storage} from 'firebase-admin/storage';

import {logger} from '@shared/services/logger.shared';

import {asyncTry} from '@shared/lib/errorUtils.shared';

import type {AsyncResult} from '@shared/types/results.types';

export const serverTimestampSupplier = (): FieldValue => FieldValue.serverTimestamp();

async function enableTelemetry(): AsyncResult<void, Error> {
  const enableTelemetryResult = await asyncTry(async () =>
    enableFirebaseTelemetry({forceDevExport: false})
  );
  if (!enableTelemetryResult.success) {
    const message = 'Failed to enable Firebase telemetry. Continuing without telemetry.';
    logger.warn(message, {error: enableTelemetryResult.error});
  }
}

export class ServerFirebaseService {
  private storageInstance: Storage;
  private firestoreInstance: Firestore;

  constructor() {
    if (admin.apps.length !== 0) {
      const message = 'Only a single `ServerFirebaseService` should be initialized on the server.';
      const error = new Error(message);
      logger.error(error);
      // Consider it a fatal error if multiple `ServerFirebaseService`s are initialized.
      // eslint-disable-next-line no-restricted-syntax
      throw error;
    }

    admin.initializeApp();

    // Enable telemetry, ignoring errors.
    void enableTelemetry();

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
