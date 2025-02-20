import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
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
    'react/jsx-no-useless-fragment': 'error',
    '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/promise-function-async': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TryStatement',
        message:
          'Using a `try` / `catch` block directly is discouraged. Use `syncTry` or `asyncTry` helpers instead.',
      },
      {
        selector: 'Identifier[name="fetch"]',
        message:
          'Using `fetch` directly is discouraged. Use `request*` helpers like `requestGet` or `requestPost` instead.',
      },
      {
        selector: 'ThrowStatement',
        message: 'Throwing errors directly is discouraged. Use `ErrorResult` instead.',
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

  // React.
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect', // Automatically pick installed version.
      },
    },
    rules: {
      'react/prop-types': 'off',
    },
  },

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
      // TODO: This should really be turned - we shouldn't assume the client library is available.
      // disallowFirebaseClientImports: true,
      disallowSharedClientImports: true,
      disallowSharedServerImports: true,
    }),
  },

  // Parser-specific config.
  {
    files: ['packages/shared/src/parsers/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportSpecifier[imported.name="assertNever"]',
          message:
            'Using `assertNever` is not allowed in parsers. Methods in parsers should not throw.',
        },
      ],
    },
  },

  // Shared client package config.
  {
    files: ['packages/sharedClient/**/*.{ts,tsx}'],
    languageOptions: {
      ...SHARED_LANGUAGE_OPTIONS,
      globals: globals.browser,
    },
    plugins: {
      react,
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
