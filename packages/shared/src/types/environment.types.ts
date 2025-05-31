export enum Environment {
  FirebaseFunctions = 'FIREBASE_FUNCTIONS',
  Scripts = 'SCRIPTS',
  PWA = 'PWA',
  Extension = 'EXTENSION',
}

export type ClientEnvironment = Environment.PWA | Environment.Extension;

export type ServerEnvironment = Environment.FirebaseFunctions | Environment.Scripts;
