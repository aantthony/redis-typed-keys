const { resolve } = require('node:path');

const project = resolve(__dirname, 'tsconfig.json');

/** @type{import('eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  extends: [
    require.resolve('@vercel/style-guide/eslint/node'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
  ],
  parserOptions: {
    project,
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
};
