import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, connectAuthEmulator, getAuth} from 'firebase/auth';
import {connectFirestoreEmulator, Firestore, getFirestore} from 'firebase/firestore';
import {connectFunctionsEmulator, Functions, getFunctions} from 'firebase/functions';
import {connectStorageEmulator, FirebaseStorage, getStorage} from 'firebase/storage';

import {FirebaseConfig} from '@shared/types/firebase.types';

interface FirebaseServiceConfig {
  readonly config: FirebaseConfig;
  readonly isEmulatorEnabled: boolean;
}

export class FirebaseService {
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

  constructor({config, isEmulatorEnabled}: FirebaseServiceConfig) {
    this.config = config;
    this.app = initializeApp(this.config);

    this.isEmulatorEnabled = isEmulatorEnabled;
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
    } = FirebaseService;

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
