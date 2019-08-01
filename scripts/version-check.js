/* eslint-disable */

const path = require('path')
const execa = require('execa')
const chalk = require('chalk').default
const readPkg = require('read-pkg')

const yarn = async (args, opts) => JSON.parse(await execa.stdout('yarn', [...args, '--json'], opts)).data

!(async () => {
  const { workspaceRootFolder } = JSON.parse(await yarn(['config', 'current']))
  const workspaces = JSON.parse(await yarn(['workspaces', 'info']))

  const getWorkspace = name => path.resolve(workspaceRootFolder, workspaces[name].location)
  const getWorkspacePackage = name => readPkg({ cwd: getWorkspace(name) })

  let exitCode = 0

  for (const [name, { mismatchedWorkspaceDependencies }] of Object.entries(workspaces)) {
    if (!mismatchedWorkspaceDependencies.length) continue

    exitCode = 1 // Exit with a non-zero
    const {
      dependencies: dep = {},
      devDependencies: dev = {},
      optionalDependencies: opt = {}
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
