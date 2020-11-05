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

const path = require('path')
const execa = require('execa')
const { getWorkspaces, getWorkspaceConfig } = require('./utils')

!(async () => {
  const { workspaceRootFolder } = await getWorkspaceConfig()
  const workspaces = await getWorkspaces()
  const args = process.argv.slice(2)

  // TODO: Ensure workspaceDependencies are published first?
  for (const [name, { location }] of Object.entries(workspaces)) {
    console.log(name)
    await execa.node(require.resolve('./release'), args, {
      cwd: path.resolve(workspaceRootFolder, location),
      stdio: 'inherit',
    })
  }
})()
