import {z} from 'zod/v4';

export const ScriptsEnvironmentVariablesSchema = z.object({
  FIREBASE_USER_ID: z.string().min(1),
  FIRECRAWL_API_KEY: z.string().min(1),
  INTERNAL_ACCOUNT_EMAIL_ADDRESS: z.email(),
});

export interface ScriptsEnvironmentVariables {
  readonly firebaseUserId: string;
  readonly firecrawlApiKey: string;
  readonly internalAccountEmailAddress?: string;
}
