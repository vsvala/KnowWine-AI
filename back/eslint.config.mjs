import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
//import stylisticJs from '@stylistic/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
//import prettierConfig from 'eslint-config-prettier';

//npx eslint index.js
//npm run lint -- --fix
//npm run lint && echo "✅ No lint issues"
//npm run lint -- --max-warnings 0

export default defineConfig([
  { ignores: ['dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
      ecmaVersion: 'latest',
    },
    plugins: {
      //'@stylistic/js': stylisticJs,
      prettier: prettierPlugin,
    },
    rules: {
      // '@stylistic/js/indent': ['error', 2],
      // '@stylistic/js/linebreak-style': ['error', 'unix'],
      // '@stylistic/js/quotes': ['error', 'single'],
      // '@stylistic/js/semi': ['error', 'never'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error', // varoittaa, jos koodissa yhtäsuuruutta verrataan muuten kuin käyttämällä kolmea = ‑merkkiä.
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'prettier/prettier': 'error',
      //'no-console': 'off',
    },

    //extends: ['eslint:recommended', 'prettier'],
  },
]);
