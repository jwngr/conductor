import baseConfig from '../../jest.base.config.mjs';

/** @type {import('jest').Config} */
export default {
  ...baseConfig,
  moduleNameMapper: {
    '^@sharedServer/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
};
