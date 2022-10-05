# eslint-config-ts-react

Sharable `eslint` config for React TypeScript projects.

Please refer to `@commercelayer/eslint-config-ts` to learn more about the configuration (ESLint + JS Standard + Prettier).

## How to use

Install ESLinst along with this package.

```
pnpm install eslint @commercelayer/eslint-config-ts-react
```

Create a new file `.eslintrc.json` with the following content:

```jsonc
{
  "extends": ["@commercelayer/eslint-config-ts-react"]
}
```

Add the following scripts to your `package.json` file:

```jsonc
  "scripts": {
    // ...
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    // ...
  },
```

Check optional steps [here](https://github.com/commercelayer/common-utils/tree/main/packages/eslint-config-ts#optional-steps).
