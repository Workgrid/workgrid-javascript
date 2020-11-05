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

const chalk = require('chalk')
const { resolve } = require('path')
const { readPkg, getWorkspaces, getWorkspaceConfig } = require('./utils')

!(async () => {
  const { workspaceRootFolder } = await getWorkspaceConfig()
  const workspaces = await getWorkspaces()

  const getWorkspace = (name) => resolve(workspaceRootFolder, workspaces[name].location)
  const getWorkspacePackage = (name) => readPkg(getWorkspace(name))

  let exitCode = 0

  for (const [name, { mismatchedWorkspaceDependencies }] of Object.entries(workspaces)) {
    if (!mismatchedWorkspaceDependencies.length) continue

    exitCode = 1 // Exit with a non-zero
    const {
      dependencies: dep = {},
      devDependencies: dev = {},
      optionalDependencies: opt = {},
    } = await getWorkspacePackage(name)

    for (const dependencyName of mismatchedWorkspaceDependencies) {
      const { version } = await getWorkspacePackage(dependencyName)
      const expectedVersion = dev[dependencyName] || dep[dependencyName] || opt[dependencyName]

      console.error(
        chalk`{red error}`,
        chalk`Package "{cyan ${name}}" must depend on the current version of "{cyan ${dependencyName}}":`,
        chalk`"{green ${version}}" vs "{red ${expectedVersion}}"`
      )
    }
  }

  process.exit(exitCode)
})()
