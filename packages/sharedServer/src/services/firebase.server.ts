import admin from 'firebase-admin';

admin.initializeApp();

export const firestore = admin.firestore();

export const FIREBASE_STORAGE_BUCKET = admin.storage().bucket();
export const FIREBASE_PROJECT_ID = admin.instanceId().app.options.projectId;

export class ServerFirebaseService {
  private appInstance: admin.app.App;
  private storageInstance: admin.storage.Storage | null = null;
  private firestoreInstance: admin.firestore.Firestore | null = null;

  constructor() {
    this.appInstance = admin.initializeApp();
  }

  public get app(): admin.app.App {
    return this.appInstance;
  }

  public get storage(): admin.storage.Storage {
    if (!this.storageInstance) {
      this.storageInstance = admin.storage();
    }
    return this.storageInstance;
  }

  public get firestore(): admin.firestore.Firestore {
    if (!this.firestoreInstance) {
      this.firestoreInstance = admin.firestore();
    }
    return this.firestoreInstance;
  }
}

export const firebaseService = new ServerFirebaseService();
