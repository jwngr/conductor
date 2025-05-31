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
export const BaseExperimentDefinitionFromStorageSchema = z.object({
  experimentId: ExperimentIdSchema,
  experimentType: ExperimentTypeSchema,
  environments: z.array(EnvironmentSchema),
  title: z.string(),
  description: z.string(),
  visibility: ExperimentVisibilitySchema,
});

export type BaseExperimentDefinitionFromStorage = z.infer<
  typeof BaseExperimentDefinitionFromStorageSchema
>;

export const BooleanExperimentDefinitionFromStorageSchema =
  BaseExperimentDefinitionFromStorageSchema.extend({
    experimentType: z.literal(ExperimentType.Boolean),
    defaultValue: z.boolean(),
  });

export type BooleanExperimentDefinitionFromStorage = z.infer<
  typeof BooleanExperimentDefinitionFromStorageSchema
>;

export const StringExperimentDefinitionFromStorageSchema =
  BaseExperimentDefinitionFromStorageSchema.extend({
    experimentType: z.literal(ExperimentType.String),
    defaultValue: z.string(),
  });

export type StringExperimentDefinitionFromStorage = z.infer<
  typeof StringExperimentDefinitionFromStorageSchema
>;

export type ExperimentDefinitionFromStorage =
  | BooleanExperimentDefinitionFromStorage
  | StringExperimentDefinitionFromStorage;

/**
 * Zod schema for an {@link ExperimentOverride} persisted to Firestore.
 */
const BaseExperimentOverrideFromStorageSchema = z.object({
  experimentId: ExperimentIdSchema,
  experimentType: ExperimentTypeSchema,
  isEnabled: z.boolean(),
});

const BooleanExperimentOverrideFromStorageSchema = BaseExperimentOverrideFromStorageSchema.extend({
  experimentType: z.literal(ExperimentType.Boolean),
});

const StringExperimentOverrideFromStorageSchema = BaseExperimentOverrideFromStorageSchema.extend({
  experimentType: z.literal(ExperimentType.String),
  value: z.string(),
});

const ExperimentOverrideFromStorageSchema = z.union([
  BooleanExperimentOverrideFromStorageSchema,
  StringExperimentOverrideFromStorageSchema,
]);

export const AccountExperimentsStateFromStorageSchema = z.object({
  accountId: AccountIdSchema,
  accountVisibility: ExperimentVisibilitySchema,
  experimentOverrides: z.record(ExperimentIdSchema, ExperimentOverrideFromStorageSchema),
  createdTime: FirestoreTimestampSchema,
  lastUpdatedTime: FirestoreTimestampSchema,
});

export type AccountExperimentsStateFromStorage = z.infer<
  typeof AccountExperimentsStateFromStorageSchema
>;
