import {z} from 'zod/v4';

import {ExperimentId, ExperimentType, ExperimentVisibility} from '@shared/types/experiments.types';

import {EnvironmentSchema} from '@shared/schemas/environments.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {AccountIdSchema} from '@shared/schemas/ids.schema';

export const ExperimentIdSchema = z.enum(ExperimentId);
export const ExperimentTypeSchema = z.enum(ExperimentType);
export const ExperimentVisibilitySchema = z.enum(ExperimentVisibility);

/////////////////////////////
//  EXPERIMENT DEFINITION  //
/////////////////////////////
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

const StringExperimentDefinitionSchema = BaseExperimentDefinitionSchema.extend({
  experimentType: z.literal(ExperimentType.String),
  defaultValue: z.string(),
});

type BooleanExperimentDefinitionFromStorage = z.infer<typeof BooleanExperimentDefinitionSchema>;
type StringExperimentDefinitionFromStorage = z.infer<typeof StringExperimentDefinitionSchema>;
export type ExperimentDefinitionFromStorage =
  | BooleanExperimentDefinitionFromStorage
  | StringExperimentDefinitionFromStorage;

/** Type for an {@link ExperimentDefinition} persisted to Firestore. */
export const ExperimentDefinitionSchema = z.union([
  BooleanExperimentDefinitionSchema,
  StringExperimentDefinitionSchema,
]);

///////////////////////////
//  EXPERIMENT OVERRIDE  //
///////////////////////////
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

export type BooleanExperimentOverrideFromStorage = z.infer<typeof BooleanExperimentOverrideSchema>;
export type StringExperimentOverrideFromStorage = z.infer<typeof StringExperimentOverrideSchema>;
export type ExperimentOverrideFromStorage = z.infer<typeof ExperimentOverrideSchema>;

///////////////////////////
//  ACCOUNT EXPERIMENTS  //
///////////////////////////
export const AccountExperimentsStateSchema = z.object({
  accountId: AccountIdSchema,
  accountVisibility: ExperimentVisibilitySchema,
  // Intentionall do not use `ExperimentId` as the key type because this may include historical
  // experiments which are no longer defined in `ExperimentId`. These get filtered out when parsing.
  experimentOverrides: z.record(z.string(), ExperimentOverrideSchema),
  createdTime: FirestoreTimestampSchema,
  lastUpdatedTime: FirestoreTimestampSchema,
});

/** Type for an {@link AccountExperimentsState} persisted to Firestore. */
export type AccountExperimentsStateFromStorage = z.infer<typeof AccountExperimentsStateSchema>;
