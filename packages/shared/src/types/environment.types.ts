export enum Environment {
  Server = 'SERVER',
  PWA = 'PWA',
  Extension = 'EXTENSION',
}

export type ClientEnvironment = Environment.PWA | Environment.Extension;

export type ServerEnvironment = Environment.Server;
