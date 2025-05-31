import {enableFirebaseTelemetry} from '@genkit-ai/firebase';
import admin from 'firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

admin.initializeApp();

export const firestore = admin.firestore();
firestore.settings({
  ignoreUndefinedProperties: true,
});

export const storage = admin.storage();

export const serverTimestampSupplier = (): FieldValue => FieldValue.serverTimestamp();

enableFirebaseTelemetry({
  forceDevExport: false,
}).catch((error) => {
  logger.error(prefixError(error, 'Failed to enable Firebase telemetry'));
});
