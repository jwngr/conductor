import {z} from 'zod';

import {ExperimentId, ExperimentType, ExperimentVisibility} from '@shared/types/experiments.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {EnvironmentSchema} from '@shared/schemas/environments.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';

export const ExperimentIdSchema = z.nativeEnum(ExperimentId);
export const ExperimentTypeSchema = z.nativeEnum(ExperimentType);
export const ExperimentVisibilitySchema = z.nativeEnum(ExperimentVisibility);

/**
 * Zod schema for an {@link ExperimentDefinition} persisted to Firestore.
 */
const BaseExperimentDefinitionSchema = z.object({
  experimentId: ExperimentIdSchema,
  experimentType: ExperimentTypeSchema,
  environments: z.array(EnvironmentSchema),
  title: z.string(),
  description: z.string(),
  visibility: ExperimentVisibilitySchema,
  defaultIsEnabled: z.boolean(),
});

const BooleanExperimentDefinitionSchema = BaseExperimentDefinitionSchema.extend({
  experimentType: z.literal(ExperimentType.Boolean),
});

type BooleanExperimentDefinitionFromStorage = z.infer<typeof BooleanExperimentDefinitionSchema>;

const StringExperimentDefinitionSchema = BaseExperimentDefinitionSchema.extend({
  experimentType: z.literal(ExperimentType.String),
  defaultValue: z.string(),
});

type StringExperimentDefinitionFromStorage = z.infer<typeof StringExperimentDefinitionSchema>;

export type ExperimentDefinitionFromStorage =
  | BooleanExperimentDefinitionFromStorage
  | StringExperimentDefinitionFromStorage;

export const ExperimentDefinitionSchema = z.union([
  BooleanExperimentDefinitionSchema,
  StringExperimentDefinitionSchema,
]);

/**
 * Zod schema for an {@link ExperimentOverride} persisted to Firestore.
 */
const BaseExperimentOverrideSchema = z.object({
  experimentId: ExperimentIdSchema,
  experimentType: ExperimentTypeSchema,
  isEnabled: z.boolean(),
});

const BooleanExperimentOverrideSchema = BaseExperimentOverrideSchema.extend({
  experimentType: z.literal(ExperimentType.Boolean),
});

const StringExperimentOverrideSchema = BaseExperimentOverrideSchema.extend({
  experimentType: z.literal(ExperimentType.String),
  value: z.string(),
});

const ExperimentOverrideSchema = z.union([
  BooleanExperimentOverrideSchema,
  StringExperimentOverrideSchema,
]);

export const AccountExperimentsStateSchema = z.object({
  accountId: AccountIdSchema,
  accountVisibility: ExperimentVisibilitySchema,
  experimentOverrides: z.record(ExperimentIdSchema, ExperimentOverrideSchema),
  createdTime: FirestoreTimestampSchema,
  lastUpdatedTime: FirestoreTimestampSchema,
});

export type AccountExperimentsStateFromStorage = z.infer<typeof AccountExperimentsStateSchema>;
