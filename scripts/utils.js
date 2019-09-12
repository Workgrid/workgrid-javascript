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
  return JSON.parse(result.stdout || result.stderr).data
}

const isPublished = async (name, version) => {
  const pkg = await yarn(['info', name])
  return includes(pkg.versions, version)
}

const getWorkspaces = async () => JSON.parse(await yarn(['workspaces', 'info']))

const getWorkspaceConfig = async () => JSON.parse(await yarn(['config', 'current']))

const getWorkspaceDependencies = async name => {
  const workspaceDependencyPaths = ['workspaceDependencies', 'mismatchedWorkspaceDependencies']
  return flatten(values(pick(get(await getWorkspaces(), name), workspaceDependencyPaths)))
}

const readPkg = cwd => readJSON(resolve(cwd, 'package.json'))

const writePkg = (cwd, data) => writeJSON(resolve(cwd, 'package.json'), data, { spaces: 2 })

const getSHA = () => git(['show', '-s', '--format=%h'])

const updateCanaryVersions = async cwd => {
  const sha = await getSHA()
  const pkg = await readPkg(cwd)

  set(pkg, 'version', `0.0.0-${sha}`)
  set(pkg, 'publishConfig.tag', 'canary')

  map(await getWorkspaceDependencies(pkg.name), name => {
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
  updateCanaryVersions
}
