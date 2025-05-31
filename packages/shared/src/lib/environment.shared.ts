import {Environment} from '@shared/types/environment.types';

export const ALL_CLIENT_ENVIRONMENTS = [Environment.PWA, Environment.Extension];
export const ALL_SERVER_ENVIRONMENTS = [Environment.FirebaseFunctions];
export const ALL_ENVIRONMENTS = [...ALL_CLIENT_ENVIRONMENTS, ...ALL_SERVER_ENVIRONMENTS];
