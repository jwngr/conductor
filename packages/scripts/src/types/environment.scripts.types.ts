import {z} from 'zod/v4';

import type {EmailAddress} from '@shared/types/emails.types';

export const ScriptsEnvironmentVariablesSchema = z.object({
  LOCAL_EMAIL_ADDRESS: z.email(),
  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIRECRAWL_API_KEY: z.string().min(1),
});

export interface ScriptsEnvironmentVariables {
  readonly localEmailAddress: EmailAddress;
  readonly googleCloudProject: string;
  readonly firebaseProjectId: string;
  readonly firecrawlApiKey: string;
}
