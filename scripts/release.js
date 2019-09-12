const execa = require('execa')
const { get } = require('lodash')
const { readPkg, isPublished, updateCanaryVersions } = require('./utils')

const yarn = async (args, opts) => {
  const { stdout } = await execa('yarn', [...args, '--json'], opts)

  try {
    return JSON.parse(stdout).data
  } catch (e) {
    console.log('Error parsing', stdout)
    return stdout
  }
}

const canary = process.argv.includes('--canary')
const dryRun = process.argv.includes('--dry-run')

// TODO: Fail if a dependency is private/unpublished?
// or if a package is private but listed as a dependency?
!(async () => {
  const cwd = process.cwd()
  if (canary) await updateCanaryVersions(cwd)

  const pkg = await readPkg(cwd)
  if (pkg.private) return // skip private packages

  const tag = get(pkg, 'publishConfig.tag', 'latest')
  const version = pkg.version + (tag !== 'latest' ? ` [${tag}]` : '')

  // await new Promise(resolve => setTimeout(resolve, 10000))
  const alreadyPublished = await isPublished(pkg.name, pkg.version)
  if (alreadyPublished) return console.log(`Skipping - ${version} already published`)

  if (!dryRun) await yarn(['publish'], { cwd })
  console.log(`Published ${version}`)
})()
