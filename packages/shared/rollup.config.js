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

const globals = require('rollup-plugin-node-globals')
const builtins = require('rollup-plugin-node-builtins')

const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

const json = require('@rollup/plugin-json')
const ts = require('rollup-plugin-ts')

const { terser } = require('rollup-plugin-terser')
const bundleSize = require('rollup-plugin-bundle-size')
const { visualizer } = require('rollup-plugin-visualizer')

const builtinModules = require('builtin-modules')
const { keys, includes } = require('lodash')

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
  const browsers = pkg.browserslist || [
    'last 2 chrome version',
    'last 2 safari version',
    'last 2 firefox version',
    'last 2 edge version',
    'last 2 opera version',
  ]
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
        nodeResolve({
          preferBuiltins: true,
        }),
        commonjs(),

        json(),
        ts({
          browserslist: [`node ${node}`],
          transpiler: 'babel',
          babelConfig: {
            plugins: [[require.resolve('babel-plugin-lodash')]],
          },
        }),

        bundleSize(),
        visualizer({
          filename: `${pkg.main}.html`,
          template: 'treemap',
        }),
      ],
    },
    // umd
    pkg.unpkg && {
      input,
      output: [
        {
          file: pkg.unpkg,
          format: 'umd',
          name: amdName,
          sourcemap: true,
          exports: 'auto',
          banner: license,
        },
      ],
      preserveSymlinks: true, // yarn workspaces
      plugins: [
        nodeResolve({
          preferBuiltins: true,
          browser: true,
        }),
        commonjs(),

        globals(),
        builtins(),

        json(),
        ts({
          browserslist: browsers,
          transpiler: 'babel',
          babelConfig: {
            targets: browsers,
            plugins: [
              [require.resolve('babel-plugin-polyfill-corejs3'), { method: 'usage-pure' }],
              [require.resolve('babel-plugin-lodash')],
            ],
          },
        }),

        terser(),
        bundleSize(),
        visualizer({
          filename: `${pkg.unpkg}.html`,
          template: 'treemap',
        }),
      ],
    },
  ].filter(Boolean)
}
