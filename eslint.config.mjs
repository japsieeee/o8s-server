// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'eslint.config.mjs'],
  },

  // Base ESLint + TS rules
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      // --- Prettier (auto formatting) ---
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 100,
          semi: true,
          tabWidth: 2,
          useTabs: false,
          endOfLine: 'lf',
        },
      ],

      /* Disallow arrow functions as declarations, but allow in callbacks */
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'VariableDeclarator > ArrowFunctionExpression, ExportDefaultDeclaration > ArrowFunctionExpression',
          message: 'Arrow functions are disallowed for declarations. Use named functions instead.',
        },
      ],

      /* Require named function expressions (except callbacks) */
      'func-names': ['error', 'as-needed'],

      /* Enforce camelCase for functions, methods, variables (allow UPPER_CASE for consts) */
      '@typescript-eslint/naming-convention': [
        'error',
        // ✅ Functions must be camelCase
        {
          selector: 'function',
          format: ['camelCase'],
        },
        // ✅ Variables default to camelCase
        {
          selector: 'variable',
          format: ['camelCase'],
          leadingUnderscore: 'allow', // still lets you prefix _privateVar
        },
        // ✅ Constants (ALL_CAPS with underscores) are allowed
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE'],
          filter: {
            regex: '^[A-Z0-9_]+$', // explicitly allow ALL_CAPS_SNAKE_CASE
            match: true,
          },
        },
        // ✅ Types must be PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],

      /* Promise safety */
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],

      /* Ban any (except tests) */
      '@typescript-eslint/no-explicit-any': 'error',

      /* Require explicit return types on exported functions */
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        { allowTypedFunctionExpressions: true, allowHigherOrderFunctions: true },
      ],

      /* Best practices */
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
      'no-duplicate-imports': 'error',
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  /* Test overrides */
  {
    files: ['*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
);
