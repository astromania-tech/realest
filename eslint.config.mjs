import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    ignores: ['node_modules/**', '.next/**', 'public/**', 'docs/engineering/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Base TS hygiene
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Note: Shadcn import guardrail disabled due to ESLint selector regex limitations
      // Manual code review required for new @/components/ui imports
      // Allowed: command, combobox, context-menu, data-table
      // Prefer: HeroUI/UntitledUI for other components
    },
  },
]
