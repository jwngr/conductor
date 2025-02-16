import {enableFirebaseTelemetry} from '@genkit-ai/firebase';
import admin from 'firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';

admin.initializeApp();

export const firestore = admin.firestore();

export const storage = admin.storage();

export const serverTimestampSupplier = () => FieldValue.serverTimestamp();

enableFirebaseTelemetry({
  forceDevExport: false,
});
