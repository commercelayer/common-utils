module.exports = {
  extends: [
    '@commercelayer/eslint-config-ts', // our base config
    'standard-jsx', // set of rules defined for react and jsx from the official pkg
    'prettier' // disable other formatting rules
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: [],
  rules: {}
}
