import admin from 'firebase-admin';

admin.initializeApp();

export class ServerFirebaseService {
  private appInstance: admin.app.App;
  private storageInstance: admin.storage.Storage | null = null;
  private firestoreInstance: admin.firestore.Firestore | null = null;

  constructor() {
    this.appInstance = admin.app();
  }

  public get app(): admin.app.App {
    return this.appInstance;
  }

  public get projectId(): string | undefined {
    return this.appInstance.options.projectId;
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
