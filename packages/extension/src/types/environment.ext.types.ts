import {z} from 'zod/v4';

export const ExtensionEnvironmentVariablesSchema = z.object({
  DEV: z.boolean().default(false),
  API_KEY: z.string().min(1),
  AUTH_DOMAIN: z.string().min(1),
  PROJECT_ID: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1),
  MESSAGING_SENDER_ID: z.string().min(1),
  APP_ID: z.string().min(1),
  MEASUREMENT_ID: z.string().min(1).optional(),
  CONDUCTOR_URL: z.url(),
  FIREBASE_USE_EMULATOR: z.stringbool().default(false),
});

export type ExtensionEnvironmentVariables = z.infer<typeof ExtensionEnvironmentVariablesSchema>;
