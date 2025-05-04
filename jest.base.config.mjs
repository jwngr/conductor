/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node', // TODO: Consider switching to browser environment where needed
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {useESM: true}],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageDirectory: 'coverage',
};
