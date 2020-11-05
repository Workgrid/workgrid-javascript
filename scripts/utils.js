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

const execa = require('execa')
const { resolve } = require('path')
const { readJSON, writeJSON } = require('fs-extra')
const { map, get, set, has, pick, values, flatten, includes } = require('lodash')

const git = async (args, opts) => {
  const result = await execa('git', [...args], opts)
  return result.stdout
}

const yarn = async (args, opts) => {
  const result = await execa('yarn', [...args, '--json'], opts)
  const { type, data } = JSON.parse(result.stdout || result.stderr)
  return type != null ? data : result.stdout || resolve.stderr
}

const isPublished = async (name, version) => {
  const pkg = await yarn(['info', name])
  return includes(pkg.versions, version)
}

const getWorkspaces = async () => JSON.parse(await yarn(['workspaces', 'info']))

const getWorkspaceConfig = async () => JSON.parse(await yarn(['config', 'current']))

const getWorkspaceDependencies = async (name) => {
  const workspaceDependencyPaths = ['workspaceDependencies', 'mismatchedWorkspaceDependencies']
  return flatten(values(pick(get(await getWorkspaces(), name), workspaceDependencyPaths)))
}

const readPkg = (cwd) => readJSON(resolve(cwd, 'package.json'))

const writePkg = (cwd, data) => writeJSON(resolve(cwd, 'package.json'), data, { spaces: 2 })

const getSHA = () => git(['show', '-s', '--format=%h'])

const updateCanaryVersions = async (cwd) => {
  const sha = await getSHA()
  const pkg = await readPkg(cwd)

  set(pkg, 'version', `0.0.0-${sha}`)
  set(pkg, 'publishConfig.tag', 'canary')

  map(await getWorkspaceDependencies(pkg.name), (name) => {
    if (has(pkg.dependencies, name)) set(pkg.dependencies, name, pkg.version)
    if (has(pkg.devDependencies, name)) set(pkg.devDependencies, name, pkg.version)
    if (has(pkg.peerDependencies, name)) set(pkg.peerDependencies, name, pkg.version)
  })

  await writePkg(cwd, pkg)
}

module.exports = {
  git,
  yarn,
  isPublished,
  getWorkspaces,
  getWorkspaceConfig,
  getWorkspaceDependencies,
  readPkg,
  writePkg,
  getSHA,
  updateCanaryVersions,
}
