import {enableFirebaseTelemetry} from '@genkit-ai/firebase';
import admin from 'firebase-admin';
import type {Auth} from 'firebase-admin/auth';
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
  return enableTelemetryResult;
}

export class ServerFirebaseService {
  private authInstance: Auth;
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

    try {
      logger.log('Initializing Firebase admin...');
      admin.initializeApp();
      logger.log('Successfully initialized Firebase admin');
    } catch (error) {
      logger.error('Failed to initialize Firebase admin', {error});
      throw error;
    }

    // Enable telemetry, ignoring errors.
    void enableTelemetry();

    this.authInstance = admin.auth();
    this.storageInstance = admin.storage();
    this.firestoreInstance = admin.firestore();
    this.firestoreInstance.settings({ignoreUndefinedProperties: true});

    // To run against the Firestore emulator, set the `FIRESTORE_EMULATOR_HOST` environment variable
    // to `127.0.0.1:8080` in `.env`.
  }

  public get auth(): Auth {
    return this.authInstance;
  }

  public get storage(): Storage {
    return this.storageInstance;
  }

  public get firestore(): Firestore {
    return this.firestoreInstance;
  }
}
