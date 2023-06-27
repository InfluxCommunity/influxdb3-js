#!/usr/bin/env bash

set -e

SCRIPT_PATH="$( cd "$(dirname "$0")" || exit ; pwd -P )"

# Update Version
VERSION=$(cat packages/client/src/impl/version.ts | sed 's/[^0-9.]*//g' | awk -F. '{$2+=1; OFS="."; print $1"."$2"."$3}')
sed -i -e "s/CLIENT_LIB_VERSION = '.*'/CLIENT_LIB_VERSION = '${VERSION}.nightly'/" packages/client/src/impl/version.ts
yarn lerna version "$VERSION"-nightly."$CIRCLE_BUILD_NUM" --no-git-tag-version --yes
git config user.name "CircleCI Builder"
git config user.email "noreply@influxdata.com"
git commit -am "chore(release): prepare to release influxdb3-js-${VERSION}.nightly"

# Build Core
cd "${SCRIPT_PATH}"/..
yarn build

# Publish
# yarn lerna publish --canary from-package --no-git-tag-version --force-publish --preid nightly --yes
yarn lerna publish --canary from-package --no-git-tag-version --no-push --preid nightly --yes
