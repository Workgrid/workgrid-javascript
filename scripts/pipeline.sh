set -e                          # Exit immediately if a command exits with a non-zero status.

source ~/.bash_profile          # Ensure nvm is available
nvm install                     # Use the correct node version

npm install --global npx        # Ensure npx is available
npm install --global yarn@1     # Ensure yarn (version 1) is available

npx @workgrid/audit             # Audit the dependencies
yarn install --frozen-lockfile  # Ensure we don't modify the lock file

yarn test

if [ "$bamboo_repository_branch_name" == "master" ]; then
  yarn release
fi
