// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
      ignores: [
        'dist',
        'coverage',
        'node_modules',
        '.nestjs',
        '*.js',
        '*.cjs',
        '*.mjs',
      ],
    },

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

      rules: {
        // ========= TypeScript =========

        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',

        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],

        // Disable the heaviest rules.
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',

        // ========= JavaScript =========

        'no-console': 'off',

        // ========= Prettier =========

        'prettier/prettier': 'warn',
      },
    },
);
