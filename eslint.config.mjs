import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const SHARED_LANGUAGE_OPTIONS = {
  ecmaVersion: 2022,
  sourceType: 'module',
  parser: tseslint.parser,
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: '.',
  },
};

const NO_RELATIVE_IMPORTS_PATTERN = {
  group: ['.*'],
  message: 'Use imports like `@src` and `@shared` instead of relative paths.',
};

const NO_FIREBASE_ADMIN_IMPORT_PATTERN = {
  group: ['firebase-admin', 'firebase-admin/*'],
  message:
    'Importing from the `firebase-admin` library is not allowed in this package. Use the `firebase` client-side library instead.',
};

const NO_FIREBASE_CLIENT_IMPORT_PATTERN = {
  group: ['firebase', 'firebase/*'],
  message:
    'Importing from the client-side `firebase` library is not allowed in this package. Use the `firebase-admin` library instead.',
};

const NO_SHARED_CLIENT_IMPORT_PATTERN = {
  group: ['@sharedClient', '@sharedClient/*'],
  message: 'Importing from the `@sharedClient` package is not allowed in this package.',
};

const NO_SHARED_SERVER_IMPORT_PATTERN = {
  group: ['@sharedServer', '@sharedServer/*'],
  message: 'Importing from the `@sharedServer` package is not allowed in this package.',
};

function makeSharedRules({
  disallowFirebaseAdminImports = false,
  disallowFirebaseClientImports = false,
  disallowSharedClientImports = false,
  disallowSharedServerImports = false,
}) {
  return {
    'no-console': 'error',
    '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
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
          NO_RELATIVE_IMPORTS_PATTERN,
          disallowFirebaseAdminImports ? NO_FIREBASE_ADMIN_IMPORT_PATTERN : null,
          disallowFirebaseClientImports ? NO_FIREBASE_CLIENT_IMPORT_PATTERN : null,
          disallowSharedClientImports ? NO_SHARED_CLIENT_IMPORT_PATTERN : null,
          disallowSharedServerImports ? NO_SHARED_SERVER_IMPORT_PATTERN : null,
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

  {
    // CLI settings.
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // This effectively sets max-warnings to 0, but allows TODOs to be ignored.
      'no-warning-comments': [
        'error',
        {
          terms: ['fixme', 'xxx', 'hack'],
          location: 'start',
        },
      ],
    },
  },

  // Shared models/lib package config.
  {
    files: ['packages/shared/src/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    rules: makeSharedRules({
      disallowFirebaseAdminImports: true,
      disallowSharedClientImports: true,
      disallowSharedServerImports: true,
    }),
  },

  // Shared client package config.
  {
    files: ['packages/sharedClient/**/*.{ts,tsx}'],
    languageOptions: {
      ...SHARED_LANGUAGE_OPTIONS,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowFirebaseAdminImports: true,
        disallowSharedServerImports: true,
      }),
    },
  },

  // Shared server package config.
  // TODO: Figure out why this is not causing lint errors for `type` imports.
  {
    files: ['packages/sharedServer/**/*.{ts}'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    rules: makeSharedRules({
      disallowFirebaseClientImports: true,
      disallowSharedClientImports: true,
    }),
  },

  // PWA package config.
  {
    files: ['packages/pwa/**/*.{ts,tsx}'],
    languageOptions: {
      ...SHARED_LANGUAGE_OPTIONS,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowFirebaseAdminImports: true,
        disallowSharedServerImports: true,
      }),
    },
  },

  // Scripts package config.
  {
    files: ['packages/scripts/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    rules: {
      ...makeSharedRules({
        disallowFirebaseClientImports: true,
        disallowSharedClientImports: true,
      }),
      // TODO: Remove this after getting @src imports working in /scripts.
      'no-restricted-imports': 'off',
    },
  },

  // Extension package config.
  {
    files: ['packages/extension/**/*.{ts,tsx}'],
    languageOptions: {
      ...SHARED_LANGUAGE_OPTIONS,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowFirebaseAdminImports: true,
        disallowSharedServerImports: true,
      }),
    },
  },

  // Functions package config.
  {
    files: ['packages/functions/**/*.{ts}'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    rules: makeSharedRules({
      disallowFirebaseClientImports: true,
      disallowSharedClientImports: true,
    }),
  }
);
