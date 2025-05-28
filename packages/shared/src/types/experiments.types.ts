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

export type ExperimentDefinition = BooleanExperimentDefinition | StringExperimentDefinition;

interface BaseExperimentState {
  readonly definition: ExperimentDefinition;
}

export interface BooleanExperimentState extends BaseExperimentState {
  readonly definition: BooleanExperimentDefinition;
  readonly value: boolean;
}

export interface StringExperimentState extends BaseExperimentState {
  readonly definition: StringExperimentDefinition;
  readonly value: string;
}

export type ExperimentState = BooleanExperimentState | StringExperimentState;

interface BaseExperimentOverride {
  readonly experimentId: ExperimentId;
  readonly experimentType: ExperimentType;
}

interface BooleanExperimentOverride extends BaseExperimentOverride {
  readonly experimentType: ExperimentType.Boolean;
  readonly value: boolean;
}

interface StringExperimentOverride extends BaseExperimentOverride {
  readonly experimentType: ExperimentType.String;
  readonly value: string;
}

export type ExperimentOverride = BooleanExperimentOverride | StringExperimentOverride;

/**
 * Account-level experiment overrides. A map from experiment ID to override state.
 */
export type AccountExperimentOverrides = Partial<Record<ExperimentId, ExperimentOverride>>;

/**
 * Account-level experiment state.
 */
export interface AccountExperimentsState {
  /**
   * The visibility level of the account. Not set for public accounts.
   */
  readonly accountVisibility: ExperimentVisibility;

  /**
   * Account-specific overrides from the default experiment values.
   *
   * Warnings:
   * 1. An experiment value here may be identical to the default value. When switching back to the
   *    default, the value is not deleted.
   * 2. The overrides may include experimernts which no longer exist. The source of truth is kept in
   *    code, which will ignore overrides for experiments which it does not know about.
   * 3. This document may not exist for a given account. It is only created when an experiment is
   *    first changed.
   */
  readonly experimentOverrides: AccountExperimentOverrides;
}
