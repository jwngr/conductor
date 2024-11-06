import admin from 'firebase-admin';

admin.initializeApp();

export const firestore = admin.firestore();

export const storageBucket = admin.storage().bucket();

export const FieldValue = admin.firestore.FieldValue;
