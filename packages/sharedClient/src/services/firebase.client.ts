import type {FirebaseApp} from 'firebase/app';
import {initializeApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import {connectAuthEmulator, getAuth} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';
import {connectFirestoreEmulator, getFirestore, serverTimestamp} from 'firebase/firestore';
import type {Functions} from 'firebase/functions';
import {connectFunctionsEmulator, getFunctions} from 'firebase/functions';
import type {FirebaseStorage} from 'firebase/storage';
import {connectStorageEmulator, getStorage} from 'firebase/storage';

import {logger} from '@shared/services/logger.shared';

import type {FirebaseConfig} from '@shared/types/firebase.types';

function validateRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    const error = new Error(`${name} environment variable is not set`);
    logger.error(error);
    // eslint-disable-next-line no-restricted-syntax
    throw error;
  }
  return value;
}

// Firebase config is stored in `.env` at the root of the repo.
function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: validateRequiredEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: validateRequiredEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: validateRequiredEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: validateRequiredEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: validateRequiredEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: validateRequiredEnvVar('VITE_FIREBASE_APP_ID'),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional.
  };
}

function getIsFirebaseEmulatorEnabled(): boolean {
  // Only enable emulator in dev mode.
  if (!import.meta.env.DEV) return false;
  // Only enable emulator if the env var is set to `true`.
  return import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true';
}

export class ClientFirebaseService {
  private app: FirebaseApp;
  private config: FirebaseConfig;
  private isEmulatorEnabled: boolean;
  private authInstance: Auth | null = null;
  private storageInstance: FirebaseStorage | null = null;
  private firestoreInstance: Firestore | null = null;
  private functionsInstance: Functions | null = null;

  private readonly EMULATOR_HOST = '127.0.0.1';
  private readonly FUNCTIONS_EMULATOR_PORT = 5001;
  private readonly FIRESTORE_EMULATOR_PORT = 8080;
  private readonly STORAGE_EMULATOR_PORT = 9199;
  private readonly AUTH_EMULATOR_PORT = 9099;

  constructor(args: {readonly config: FirebaseConfig; readonly isEmulatorEnabled: boolean}) {
    this.config = args.config;
    this.app = initializeApp(this.config);

    this.isEmulatorEnabled = args.isEmulatorEnabled;
    if (this.isEmulatorEnabled) {
      this.setupEmulators();
    }
  }

  private setupEmulators(): void {
    const auth = this.auth;
    const storage = this.storage;
    const functions = this.functions;
    const firestore = this.firestore;

    connectAuthEmulator(auth, `http://${this.EMULATOR_HOST}:${this.AUTH_EMULATOR_PORT}`, {
      // Hides the bottom banner warning about using the Firebase emulator.
      disableWarnings: true,
    });
    connectStorageEmulator(storage, this.EMULATOR_HOST, this.STORAGE_EMULATOR_PORT);
    connectFunctionsEmulator(functions, this.EMULATOR_HOST, this.FUNCTIONS_EMULATOR_PORT);
    connectFirestoreEmulator(firestore, this.EMULATOR_HOST, this.FIRESTORE_EMULATOR_PORT);
  }

  public get auth(): Auth {
    if (!this.authInstance) {
      this.authInstance = getAuth(this.app);
    }
    return this.authInstance;
  }

  public get storage(): FirebaseStorage {
    if (!this.storageInstance) {
      this.storageInstance = getStorage(this.app);
    }
    return this.storageInstance;
  }

  public get firestore(): Firestore {
    if (!this.firestoreInstance) {
      this.firestoreInstance = getFirestore(this.app);
    }
    return this.firestoreInstance;
  }

  public get functions(): Functions {
    if (!this.functionsInstance) {
      this.functionsInstance = getFunctions(this.app);
    }
    return this.functionsInstance;
  }
}

export const firebaseService = new ClientFirebaseService({
  config: getFirebaseConfig(),
  isEmulatorEnabled: getIsFirebaseEmulatorEnabled(),
});

export const clientTimestampSupplier = () => serverTimestamp();
