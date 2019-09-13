const execa = require('execa')
const { get } = require('lodash')
const { git, readPkg, isPublished, updateCanaryVersions } = require('./utils')

const canary = process.argv.includes('--canary')
const dryRun = process.argv.includes('--dry-run')

// TODO: Fail if a dependency is private/unpublished?
// or if a package is private but listed as a dependency?
!(async () => {
  const cwd = process.cwd()
  if (canary) await updateCanaryVersions(cwd)

  // TODO: Github Actions are in a detached state...
  // const branch = await git(['rev-parse', '--abbrev-ref', 'HEAD'])
  // if (canary || branch !== 'master') await updateCanaryVersions(cwd)

  const pkg = await readPkg(cwd)
  if (pkg.private) return // skip private packages

  const tag = get(pkg, 'publishConfig.tag', 'latest')
  const access = get(pkg, 'publishConfig.access', 'public')
  const version = pkg.version + (tag !== 'latest' ? ` [${tag}]` : '')

  const alreadyPublished = await isPublished(pkg.name, pkg.version)
  if (alreadyPublished) return console.log(`Skipping - ${version} already published`)

  if (!dryRun) await execa('yarn', ['publish', `--tag=${tag}`, `--access=${access}`], { cwd, stdio: 'inherit' })
  console.log(`Published ${version}`)
})()
