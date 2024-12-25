import type {FirebaseApp} from 'firebase/app';
import {initializeApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import {connectAuthEmulator, getAuth} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';
import {connectFirestoreEmulator, getFirestore} from 'firebase/firestore';
import type {Functions} from 'firebase/functions';
import {connectFunctionsEmulator, getFunctions} from 'firebase/functions';
import type {FirebaseStorage} from 'firebase/storage';
import {connectStorageEmulator, getStorage} from 'firebase/storage';

import type {FirebaseConfig} from '@shared/types/firebase.types';

interface ClientFirebaseServiceConfig {
  readonly config: FirebaseConfig;
  readonly isEmulatorEnabled: boolean;
}

export class SharedFirebaseService {
  private app: FirebaseApp;
  private config: FirebaseConfig;
  private isEmulatorEnabled: boolean;
  private authInstance: Auth | null = null;
  private storageInstance: FirebaseStorage | null = null;
  private firestoreInstance: Firestore | null = null;
  private functionsInstance: Functions | null = null;

  private static readonly EMULATOR_HOST = '127.0.0.1';
  private static readonly FUNCTIONS_EMULATOR_PORT = 5001;
  private static readonly FIRESTORE_EMULATOR_PORT = 8080;
  private static readonly STORAGE_EMULATOR_PORT = 9199;
  private static readonly AUTH_EMULATOR_PORT = 9099;

  constructor(args: ClientFirebaseServiceConfig) {
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

    const {
      EMULATOR_HOST,
      AUTH_EMULATOR_PORT,
      STORAGE_EMULATOR_PORT,
      FUNCTIONS_EMULATOR_PORT,
      FIRESTORE_EMULATOR_PORT,
    } = SharedFirebaseService;

    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
      // Hides the bottom banner warning about using the Firebase emulator.
      disableWarnings: true,
    });
    connectStorageEmulator(storage, EMULATOR_HOST, STORAGE_EMULATOR_PORT);
    connectFunctionsEmulator(functions, EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT);
    connectFirestoreEmulator(firestore, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  }

  get auth(): Auth {
    if (!this.authInstance) {
      this.authInstance = getAuth(this.app);
    }
    return this.authInstance;
  }

  get storage(): FirebaseStorage {
    if (!this.storageInstance) {
      this.storageInstance = getStorage(this.app);
    }
    return this.storageInstance;
  }

  get firestore(): Firestore {
    if (!this.firestoreInstance) {
      this.firestoreInstance = getFirestore(this.app);
    }
    return this.firestoreInstance;
  }

  get functions(): Functions {
    if (!this.functionsInstance) {
      this.functionsInstance = getFunctions(this.app);
    }
    return this.functionsInstance;
  }
}
