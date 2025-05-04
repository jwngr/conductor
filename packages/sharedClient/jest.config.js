/** @type {import('jest').Config} */
// TODO: Unify with other Jest configs.
export default {
  preset: 'ts-jest',
  // TODO: Switch to browser environment.
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@sharedClient/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {useESM: true}],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
