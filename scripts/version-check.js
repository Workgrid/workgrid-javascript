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
