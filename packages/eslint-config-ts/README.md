# eslint-config-ts

Sharable `eslint` config with `JS Standard` and `prettier` intended to be used with TypeScript projects.

This configuration simply extends `standard-ts` rules and configures `prettier` as the default formatter to have better code indentation and text wrapping.

In this way, it is possible to use all default JavaScript Standard rules but at the same time access and tune them using a regular ESLint config file (very useful for existing projects).

## How to use

Install ESLinst along with this package

```
pnpm install -D eslint @commercelayer/eslint-config-ts
```

Create a new file `.eslintrc.json` with the following content:

```jsonc
{
  "extends": ["@commercelayer/eslint-config-ts"]
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

### Optional steps

If you want to configure VSCode to automatically auto-fix and format code on save, you can
download the official [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

- configure the following options in your `.vscode/settings.json` file

```jsonc
{
  // Enable ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  // disable formatOnSave for eslint files
  "[javascript]": {
    "editor.formatOnSave": false
  },
  "[javascriptreact]": {
    "editor.formatOnSave": false
  },
  "[typescript]": {
    "editor.formatOnSave": false
  },
  "[typescriptreact]": {
    "editor.formatOnSave": false
  },
  // keep it enable for all other files
  "editor.formatOnSave": true,
  // this ensure ESLint autofix all issue (formatting is done by prettier loaded as eslint rules)
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```

**Important**: only the ESLint extension is required, so be sure you don't have prettier installed. In that case, just disable it or partially disable it only for javascript/typescript files.

## Use it in existing projects

In the case of an existing project, you might want to disable the following rules to avoid the auto-fixer drastically changing your code with the risk of breaking things.

To do so, just add the following lines to your `eslintrc.json` file:

```json
    "rules": {
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/strict-boolean-expressions": "off"
    }
```

## Notes

Eslint and Typescript are both configured as peerDependency, so you will have to install them in your project.
