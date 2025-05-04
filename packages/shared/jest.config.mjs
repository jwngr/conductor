import baseConfig from '../../jest.base.config.mjs';

/** @type {import('jest').Config} */
export default {
  ...baseConfig,
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/$1',
  },
};
