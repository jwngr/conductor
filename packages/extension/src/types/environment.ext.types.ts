import {z} from 'zod/v4';

import type {EmailAddress} from '@shared/types/emails.types';

type ViteEnvironmentMode = 'development' | 'production';

export const ExtensionEnvironmentVariablesSchema = z.object({
  // Built-in Vite variables.
  MODE: z.enum(['development', 'production']).default('development'),

  // Conductor URL.
  VITE_CONDUCTOR_URL: z.url(),

  // Default email address for passwordless sign in.
  VITE_DEFAULT_PASSWORDLESS_EMAIL_ADDRESS: z.email(),

  // Firebase config.
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Firebase emulator.
  VITE_FIREBASE_USE_EMULATOR: z.stringbool().default(false),
});

export interface ExtensionEnvironmentVariables {
  readonly mode: ViteEnvironmentMode;
  readonly conductorUrl: string;
  readonly defaultPasswordlessEmailAddress: EmailAddress;
  readonly firebaseApiKey: string;
  readonly firebaseAuthDomain: string;
  readonly firebaseProjectId: string;
  readonly firebaseStorageBucket: string;
  readonly firebaseMessagingSenderId: string;
  readonly firebaseAppId: string;
  readonly firebaseMeasurementId: string | null;
  readonly firebaseUseEmulator: boolean;
}
