import eslintPluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: './tsconfig.json',
      }
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs
    },
    rules: {
      // reglas básicas ejemplo:
      'block-spacing': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      // agrega las reglas que quieras manualmente
    }
  }
]
