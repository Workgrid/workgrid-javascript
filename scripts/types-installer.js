/* eslint-disable */

const path = require('path')
const execa = require('execa')
const chalk = require('chalk').default

const yarn = async (args, opts) => {
  const { stdout } = await execa('yarn', [...args, '--json'], opts)

  try {
    return JSON.parse(stdout).data
  } catch (e) {
    console.log('Error parsing', stdout)
    return stdout
  }
}

const npx = async (args, opts) => {
  const { stdout } = await execa('npx', [...args], opts)
  return stdout
}

!(async () => {
  const { workspaceRootFolder } = JSON.parse(await yarn(['config', 'current']))
  const workspaces = JSON.parse(await yarn(['workspaces', 'info']))

  console.log(chalk`Installing types for "{cyan workgrid-javascript}"`)
  await npx(['types-installer', 'install'], { cwd: path.resolve(__dirname, '..') })

  for (const [name, { location }] of Object.entries(workspaces)) {
    console.log(chalk`Installing types for "{cyan ${name}}"`)
    const cwd = path.resolve(workspaceRootFolder, location)
    await npx(['types-installer', 'install'], { cwd })
  }
})()
