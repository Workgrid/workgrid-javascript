// Currently unused - was experimenting with updating all the versions for a canary release prior to running the release script
// This would allow our github workflow to conditionally run the prepare script, and then always run release :)

const path = require('path')
const { values } = require('lodash')
const { getSHA, getWorkspaces, getWorkspaceConfig, updateCanaryVersions } = require('./utils')

!(async () => {
  const sha = await getSHA()

  const { workspaceRootFolder } = await getWorkspaceConfig()
  const workspaces = await getWorkspaces()

  for (const { location } of values(workspaces)) {
    const cwd = path.resolve(workspaceRootFolder, location)
    console.log(cwd)

    await updateCanaryVersions(cwd, `0.0.0-${sha}`)
  }
})()
