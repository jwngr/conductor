import baseConfig from '../../jest.base.config.mjs';

/** @type {import('jest').Config} */
export default {
  ...baseConfig,
  moduleNameMapper: {
    '^@rssServer/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^@sharedServer/(.*)$': '<rootDir>/../sharedServer/src/$1',
  },
  testEnvironment: 'node',
};
