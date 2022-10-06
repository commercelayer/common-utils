module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard-with-typescript', // all standard and ts-standard rules from the official pkg
    'prettier' // disable other formatting rules
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'prettier' // allow to use prettier/prettier as eslint rules
  ],
  rules: {
    // we need to tell prettier to use same formatting rules as required by standard
    'prettier/prettier': [
      'error',
      {
        semi: false,
        singleQuote: true,
        jsxSingleQuote: true,
        trailingComma: 'none',
        htmlWhitespaceSensitivity: 'ignore' // https://prettier.io/blog/2018/11/07/1.15.0.html#whitespace-sensitive-formatting
      }
    ]
  }
}
