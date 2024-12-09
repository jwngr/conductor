import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sharedLanguageOptions = {
  ecmaVersion: 2022,
  sourceType: 'module',
};

const sharedRules = {
  'no-console': 'error',
  '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
  '@typescript-eslint/no-extraneous-class': 'off',
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['.*'],
          message: 'Use @src or @shared imports instead of relative paths.',
        },
      ],
    },
  ],
};

export default tseslint.config(
  // ESLint.
  eslint.configs.recommended,

  // TypeScript.
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // Shared models/lib package config.
  {
    files: ['packages/shared/src/**/*.ts'],
    languageOptions: sharedLanguageOptions,
    rules: sharedRules,
  },

  // PWA package config.
  {
    files: ['packages/pwa/**/*.{ts,tsx}'],
    languageOptions: {
      ...sharedLanguageOptions,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...sharedRules,
    },
  },

  // Scripts package config.
  {
    files: ['packages/scripts/**/*.ts'],
    languageOptions: sharedLanguageOptions,
    rules: {
      ...sharedRules,
      // TODO: Remove this after getting @src imports working in /scripts.
      'no-restricted-imports': 'off',
    },
  },

  // Extension package config.
  {
    files: ['packages/extension/**/*.{ts,tsx}'],
    languageOptions: {
      ...sharedLanguageOptions,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...sharedRules,
    },
  },

  // Functions package config.
  {
    files: ['packages/functions/**/*.{ts}'],
    languageOptions: sharedLanguageOptions,
    rules: sharedRules,
  }
);
