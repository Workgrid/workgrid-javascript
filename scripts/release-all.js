// This file has been replaced by wsrun -- it handles ordering so dependencies are published first

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
