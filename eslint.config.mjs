import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sharedLanguageOptions = {
  ecmaVersion: 2022,
  sourceType: 'module',
};

const noRelativeImportsPattern = {
  group: ['.*'],
  message: 'Use @src or @shared imports instead of relative paths.',
};

const noFirebaseAdminImportPattern = {
  group: ['firebase-admin', 'firebase-admin/*'],
  message:
    'Importing from the `firebase-admin` library is not allowed in this package. Use the `firebase` client-side library instead.',
};

const noFirebaseClientImportPattern = {
  group: ['firebase', 'firebase/*'],
  message:
    'Importing from the client-side `firebase` library is not allowed in this package. Use the `firebase-admin` library instead.',
};

function makeSharedRules({
  disallowFirebaseAdminImports = false,
  disallowFirebaseClientImports = false,
}) {
  return {
    'no-console': 'error',
    '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
    '@typescript-eslint/no-extraneous-class': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TryStatement',
        message: 'Use `syncTry` or `asyncTry` helpers instead of `try` / `catch` blocks.',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          noRelativeImportsPattern,
          disallowFirebaseAdminImports ? noFirebaseAdminImportPattern : null,
          disallowFirebaseClientImports ? noFirebaseClientImportPattern : null,
        ].filter((p) => p !== null),
      },
    ],
  };
}

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
    rules: makeSharedRules({disallowFirebaseAdminImports: true}),
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
      ...makeSharedRules({disallowFirebaseAdminImports: true}),
    },
  },

  // Scripts package config.
  {
    files: ['packages/scripts/**/*.ts'],
    languageOptions: sharedLanguageOptions,
    rules: {
      ...makeSharedRules({disallowFirebaseClientImports: true}),
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
      ...makeSharedRules({disallowFirebaseAdminImports: true}),
    },
  },

  // Functions package config.
  {
    files: ['packages/functions/**/*.{ts}'],
    languageOptions: sharedLanguageOptions,
    rules: makeSharedRules({disallowFirebaseClientImports: true}),
  }
);
