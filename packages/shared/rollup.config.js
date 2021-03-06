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

const alias = require('rollup-plugin-alias')

const globals = require('rollup-plugin-node-globals')
const builtins = require('rollup-plugin-node-builtins')

const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

const json = require('rollup-plugin-json')
const typescript = require('rollup-plugin-typescript')
const babel = require('rollup-plugin-babel')

// const { terser } = require('rollup-plugin-terser')
const bundleSize = require('rollup-plugin-bundle-size')
const visualizer = require('rollup-plugin-visualizer')

const builtinModules = require('builtin-modules')
const { _, keys, includes } = require('lodash')

const path = require('path')
const semver = require('semver')
const readPkgUp = require('read-pkg-up')
const { get, upperFirst, camelCase } = require('lodash')

const outdent = require('outdent')
const license = outdent`
  /**
   * Copyright ${new Date().getFullYear()} Workgrid Software
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
`

module.exports = (input) => {
  const source = path.resolve(process.cwd(), input)
  const cwd = path.dirname(source)

  const { packageJson: pkg } = readPkgUp.sync({ cwd })
  const amdName = pkg.amdName || upperFirst(camelCase(pkg.name))
  const node = semver.major(semver.minVersion(get(pkg, 'engines.node', '12.13.0')))
  const dependencies = [...keys(pkg.dependencies), ...keys(pkg.peerDependencies)]

  return [
    // cjs
    {
      input,
      output: [
        {
          file: pkg.main,
          format: 'cjs',
          sourcemap: true,
          exports: 'auto',
          banner: license,
        },
      ],
      preserveSymlinks: true, // yarn workspaces
      external: (id) => includes([...builtinModules, ...dependencies], id.match('(@[^/]+/[^/]+|[^/]+)')[0]),
      plugins: [
        resolve({
          // extensions: ['.ts', '.js'],
          preferBuiltins: true,
        }),
        commonjs({
          namedExports: {
            lodash: keys(_),
          },
        }),

        json(),
        typescript({
          target: 'ESNEXT',
          module: 'ESNEXT',
        }),
        babel({
          compact: false,
          extensions: ['.ts', '.js'],
          exclude: [/node_modules/],
          presets: [
            [
              require.resolve('@babel/preset-env'),
              { modules: false, exclude: ['transform-typeof-symbol'], targets: { node } },
            ],
            // [require.resolve('@babel/preset-typescript')]
          ],
          plugins: [
            // [require.resolve('@babel/plugin-proposal-class-properties')],
            [require.resolve('babel-plugin-lodash')],
          ],
        }),
        babel({
          compact: false,
          include: [/node_modules/],
          presets: [
            [
              require.resolve('@babel/preset-env'),
              { modules: false, exclude: ['transform-typeof-symbol'], targets: { node } },
            ],
          ],
        }),

        bundleSize(),
        visualizer({
          filename: `${pkg.main}.html`,
          template: 'treemap',
        }),
      ],
    },
    // umd
    pkg.browser && {
      input,
      output: [
        {
          file: pkg.browser,
          format: 'umd',
          name: amdName,
          sourcemap: true,
          exports: 'auto',
          banner: license,
        },
      ],
      preserveSymlinks: true, // yarn workspaces
      plugins: [
        alias({
          entries: [{ find: 'crypto', replacement: require.resolve('@workgrid/crypto') }],
        }),

        resolve({
          // extensions: ['.ts', '.js'],
          preferBuiltins: true,
          // TODO: Unable to get property 'iterator' of undefined or null reference
          // browser: true
        }),
        commonjs({
          namedExports: {
            lodash: keys(_),
          },
        }),

        globals(),
        builtins(),

        json(),
        typescript({
          target: 'ESNEXT',
          module: 'ESNEXT',
        }),
        babel({
          compact: false,
          runtimeHelpers: true,
          extensions: ['.ts', '.js'],
          exclude: [/node_modules/],
          presets: [
            [require.resolve('@babel/preset-env'), { modules: false, exclude: ['transform-typeof-symbol'] }],
            // ['@babel/preset-typescript']
          ],
          plugins: [
            [require.resolve('@babel/plugin-transform-runtime'), { corejs: 3, useESModules: true }],
            // [require.resolve('@babel/plugin-proposal-class-properties')],
            [require.resolve('babel-plugin-lodash')],
          ],
        }),
        babel({
          compact: false,
          runtimeHelpers: true,
          include: [/node_modules/],
          exclude: [/@babel\/runtime/, /core-js/],
          presets: [[require.resolve('@babel/preset-env'), { modules: false, exclude: ['transform-typeof-symbol'] }]],
          plugins: [[require.resolve('@babel/plugin-transform-runtime'), { corejs: 3, useESModules: true }]],
        }),

        // terser(),
        bundleSize(),
        visualizer({
          filename: `${pkg.browser}.html`,
          template: 'treemap',
        }),
      ],

      // Ignore crypto-browser eval warning
      onwarn: (warning, defaultOnWarnHandler) => {
        if (warning.code === 'EVAL') return
        defaultOnWarnHandler(warning)
      },
    },
  ].filter(Boolean)
}
