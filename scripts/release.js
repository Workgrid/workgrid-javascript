const path = require('path')
const execa = require('execa')
// const semver = require('semver')
const readPkg = require('read-pkg')
const pReflect = require('p-reflect')
const packageJson = require('package-json')
const { get } = require('lodash')

const yarn = async (args, opts) => {
  const { stdout } = await execa('yarn', [...args, '--json'], opts)

  try {
    return JSON.parse(stdout).data
  } catch (e) {
    console.log('Error parsing', stdout)
    return stdout
  }
}

!(async () => {
  const { workspaceRootFolder } = JSON.parse(await yarn(['config', 'current']))
  const workspaces = JSON.parse(await yarn(['workspaces', 'info']))

  // TODO: Ensure workspaceDependencies are published first?
  for (const [name, { location }] of Object.entries(workspaces)) {
    const cwd = path.resolve(workspaceRootFolder, location)

    /** @type object<{ value: string }> */
    const { value: staged } = await pReflect(readPkg({ cwd }))
    if (staged.private) continue // skip private packages
    const version = get(staged, 'publishConfig.tag', 'latest')

    /** @type object<{ value: string }> */
    const { value: remote } = await pReflect(packageJson(name, { version: staged.version }))
    // const shouldPublish = remote ? semver.gt(staged.version, remote.version) : true
    const shouldPublish = !remote

    const result = shouldPublish ? 'Published' : 'Skipping'
    if (shouldPublish) await yarn(['publish'], { cwd })

    console.log(`${result} ${name}@${staged.version} ${version !== 'latest' ? `[${version}]` : ''}`)
  }
})()
