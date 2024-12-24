import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sharedLanguageOptions = {
  ecmaVersion: 2022,
  sourceType: 'module',
  parser: tseslint.parser,
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: '.',
  },
};

const noRelativeImportsPattern = {
  group: ['.*'],
  message: 'Use imports like `@src` and `@shared` instead of relative paths.',
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
    languageOptions: sharedLanguageOptions,
    rules: makeSharedRules({disallowFirebaseAdminImports: true}),
  },

  // Shared client package config.
  {
    files: ['packages/sharedClient/**/*.{ts,tsx}'],
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

  // Shared server package config.
  // TODO: Figure out why this is not causing lint errors for `type` imports.
  {
    files: ['packages/sharedServer/**/*.{ts}'],
    languageOptions: sharedLanguageOptions,
    rules: makeSharedRules({disallowFirebaseClientImports: true}),
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
