import type {Environment} from '@shared/types/environment.types';

export enum ExperimentId {
  Internal1 = 'INTERNAL_1',
  Internal2 = 'INTERNAL_2',
  Public1 = 'PUBLIC_1',
  Public2 = 'PUBLIC_2',
}

export enum ExperimentType {
  Boolean = 'BOOLEAN',
  String = 'STRING',
  Enum = 'ENUM',
}

export enum ClientPlatform {
  PWA = 'PWA',
  Extensions = 'EXTENSION',
}

export enum ExperimentVisibility {
  Internal = 'INTERNAL',
  Public = 'PUBLIC',
}

interface BaseExperimentDefinition {
  /** Unique identifier for the experiment. */
  readonly experimentId: ExperimentId;
  /** Type of experiment (e.g. boolean, string, enum). */
  readonly experimentType: ExperimentType;
  /** Environments in which the experiment is available (e.g. PWA, extension, server). */
  readonly environments: readonly Environment[];
  /** User-visible title of the experiment. */
  readonly title: string;
  /** User-visible description of the experiment. */
  readonly description: string;
  /** Which set of users can see the experiment. */
  readonly visibility: ExperimentVisibility;
}

export interface BooleanExperimentDefinition extends BaseExperimentDefinition {
  readonly experimentType: ExperimentType.Boolean;
  readonly defaultValue: boolean;
}

export interface StringExperimentDefinition extends BaseExperimentDefinition {
  readonly experimentType: ExperimentType.String;
  readonly defaultValue: string;
}

interface EnumExperimentOption {
  readonly value: string;
  readonly text: string;
}

export interface EnumExperimentDefinition extends BaseExperimentDefinition {
  readonly experimentType: ExperimentType.Enum;
  /** Default `EnumExperimentOption.value` from `options`. */
  readonly defaultValue: string;
  readonly options: readonly EnumExperimentOption[];
}

export type ExperimentDefinition =
  | BooleanExperimentDefinition
  | StringExperimentDefinition
  | EnumExperimentDefinition;

interface BaseExperimentState {
  readonly experiment: ExperimentDefinition;
  readonly isEnabled: boolean;
}

export interface BooleanExperimentState extends BaseExperimentState {
  readonly experiment: BooleanExperimentDefinition;
  readonly value: boolean;
}

export interface StringExperimentState extends BaseExperimentState {
  readonly experiment: StringExperimentDefinition;
  readonly value: string;
}

export interface EnumExperimentState extends BaseExperimentState {
  readonly experiment: EnumExperimentDefinition;
  /** `value` of the selected `EnumExperimentOption`. */
  readonly value: string;
}

export type ExperimentState = BooleanExperimentState | StringExperimentState | EnumExperimentState;
