import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
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

const SHARED_PLUGINS = {
  'unused-imports': unusedImports,
};

const NO_RELATIVE_IMPORTS_PATTERN = {
  group: ['.*'],
  message: 'Use imports like `@src` and `@shared` instead of relative paths.',
};

const NO_FIREBASE_ADMIN_IMPORT_PATTERN = {
  group: ['^firebase-admin$', '^firebase-admin/.*'],
  message:
    'Importing from the `firebase-admin` library is not allowed in this package. Use the `firebase` client-side library instead.',
};

const NO_FIREBASE_CLIENT_IMPORT_PATTERN = {
  group: ['^firebase$', '^firebase/.*'],
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

// There is a separate override below that allows test utils to be imported in test files.
const NO_TEST_UTILS_IMPORT_PATTERN = {
  group: ['@shared/lib/testUtils.shared'],
  message: 'Test utils can only be imported in test files.',
};

const BASE_RESTRICTED_SYNTAX = [
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
];

const OBJECT_RESTRICTED_SYNTAX = [
  {
    selector: "CallExpression[callee.object.name='Object'][callee.property.name='keys']",
    message:
      'Using `Object.keys` is discouraged. Use `objectKeys` from `@shared/lib/utils.shared` instead.',
  },
  {
    selector: "CallExpression[callee.object.name='Object'][callee.property.name='values']",
    message:
      'Using `Object.values` is discouraged. Use an appropriate helper from `@shared/lib/utils.shared` instead (e.g. `objectForEachValue`, `objectMapEntries`, `objectReduceValues`).',
  },
  {
    selector: "CallExpression[callee.object.name='Object'][callee.property.name='entries']",
    message:
      'Using `Object.entries` is discouraged. Use an appropriate helper from `@shared/lib/utils.shared` instead (e.g. `objectForEachEntry`, `objectMapEntries`).',
  },
  {
    selector: "CallExpression[callee.object.name='Object'][callee.property.name='fromEntries']",
    message:
      'Using `Object.fromEntries` is discouraged. Use `objectMapValues` or `arrayToRecord` from `@shared/lib/utils.shared` instead.',
  },
];

function makeSharedRules({
  disallowFirebaseAdminImports,
  disallowFirebaseClientImports,
  disallowSharedClientImports,
  disallowSharedServerImports,
}) {
  return {
    'no-console': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-no-leaked-render': ['error', {validStrategies: ['ternary']}],
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
    'no-restricted-syntax': ['error', ...BASE_RESTRICTED_SYNTAX, ...OBJECT_RESTRICTED_SYNTAX],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          NO_RELATIVE_IMPORTS_PATTERN,
          disallowFirebaseAdminImports ? NO_FIREBASE_ADMIN_IMPORT_PATTERN : null,
          disallowFirebaseClientImports ? NO_FIREBASE_CLIENT_IMPORT_PATTERN : null,
          disallowSharedClientImports ? NO_SHARED_CLIENT_IMPORT_PATTERN : null,
          disallowSharedServerImports ? NO_SHARED_SERVER_IMPORT_PATTERN : null,
          NO_TEST_UTILS_IMPORT_PATTERN,
        ].filter((p) => p !== null),
      },
    ],

    // Handle unused imports + vars via plugin which support auto-fixing.
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
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

  // Shared models/lib package config.
  {
    files: ['packages/shared/src/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    plugins: SHARED_PLUGINS,
    rules: makeSharedRules({
      disallowFirebaseAdminImports: true,
      disallowFirebaseClientImports: true,
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
        ...BASE_RESTRICTED_SYNTAX,
        ...OBJECT_RESTRICTED_SYNTAX,
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
      ...SHARED_PLUGINS,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowFirebaseAdminImports: true,
        disallowSharedServerImports: true,
        disallowFirebaseClientImports: false,
        disallowSharedClientImports: false,
      }),
    },
  },

  // Shared server package config.
  {
    files: ['packages/sharedServer/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    plugins: SHARED_PLUGINS,
    rules: makeSharedRules({
      disallowFirebaseClientImports: true,
      disallowSharedClientImports: true,
      disallowFirebaseAdminImports: false,
      disallowSharedServerImports: false,
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
      ...SHARED_PLUGINS,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowFirebaseAdminImports: true,
        disallowSharedServerImports: true,
        disallowFirebaseClientImports: false,
        disallowSharedClientImports: false,
      }),
    },
  },

  // Scripts package config.
  {
    files: ['packages/scripts/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    plugins: SHARED_PLUGINS,
    rules: {
      ...makeSharedRules({
        disallowFirebaseClientImports: true,
        disallowSharedClientImports: true,
        disallowFirebaseAdminImports: false,
        disallowSharedServerImports: false,
      }),
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
      ...SHARED_PLUGINS,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...makeSharedRules({
        disallowFirebaseAdminImports: true,
        disallowSharedServerImports: true,
        disallowFirebaseClientImports: false,
        disallowSharedClientImports: false,
      }),
    },
  },

  // Functions package config.
  {
    files: ['packages/functions/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    plugins: SHARED_PLUGINS,
    rules: makeSharedRules({
      disallowFirebaseClientImports: true,
      disallowSharedClientImports: true,
      disallowFirebaseAdminImports: false,
      disallowSharedServerImports: false,
    }),
  },

  // RSS server package config.
  {
    files: ['packages/rssServer/**/*.ts'],
    languageOptions: SHARED_LANGUAGE_OPTIONS,
    plugins: SHARED_PLUGINS,
    rules: makeSharedRules({
      disallowFirebaseClientImports: true,
      disallowSharedClientImports: true,
      disallowFirebaseAdminImports: false,
      disallowSharedServerImports: false,
    }),
  },

  // Clear the restriction on importing test utils in test files.
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-restricted-imports': ['error', {paths: []}],
    },
  },

  // Allow usage of Object.* methods in the file that defines the utils.
  {
    files: ['packages/shared/src/lib/objectUtils.shared.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...BASE_RESTRICTED_SYNTAX],
    },
  }
);
