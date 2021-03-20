/**
 * Copyright 2020 Workgrid Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  plugins: ['header'],
  rules: {
    'header/header': [
      'error',
      'block',
      [
        `*`,
        {
          pattern: ` * Copyright \\d{4} Workgrid Software`,
          template: ` * Copyright ${new Date().getFullYear()} Workgrid Software`,
        },
        ` *`,
        ` * Licensed under the Apache License, Version 2.0 (the "License");`,
        ` * you may not use this file except in compliance with the License.`,
        ` * You may obtain a copy of the License at`,
        ` *`,
        ` *     http://www.apache.org/licenses/LICENSE-2.0`,
        ` *`,
        ` * Unless required by applicable law or agreed to in writing, software`,
        ` * distributed under the License is distributed on an "AS IS" BASIS,`,
        ` * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.`,
        ` * See the License for the specific language governing permissions and`,
        ` * limitations under the License.`,
        ` `,
      ],
      2,
    ],
  },
  overrides: [
    {
      files: ['*.config.js', 'scripts/*.js'],
      env: { node: true },
    },

    {
      files: ['*.{js,ts}'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      files: ['*.test.{js,ts}'],
      extends: ['plugin:jest/recommended'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
}
