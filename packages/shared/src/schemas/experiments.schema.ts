import {z} from 'zod';

import {ExperimentId, ExperimentType, ExperimentVisibility} from '@shared/types/experiments.types';

import {EnvironmentSchema} from '@shared/schemas/environments.schema';

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

const EnumExperimentOptionSchema = z.object({
  value: z.string(),
  text: z.string(),
});

export const EnumExperimentDefinitionFromStorageSchema =
  BaseExperimentDefinitionFromStorageSchema.extend({
    experimentType: z.literal(ExperimentType.Enum),
    defaultValue: z.string(),
    options: z.array(EnumExperimentOptionSchema),
  });

export type EnumExperimentDefinitionFromStorage = z.infer<
  typeof EnumExperimentDefinitionFromStorageSchema
>;

export type ExperimentDefinitionFromStorage =
  | BooleanExperimentDefinitionFromStorage
  | StringExperimentDefinitionFromStorage
  | EnumExperimentDefinitionFromStorage;
