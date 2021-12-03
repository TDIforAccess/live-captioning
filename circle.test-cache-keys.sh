#!/usr/bin/env bash
set -e
: required environment variables:
: CIRCLE_BRANCH is the current branch: ${CIRCLE_BRANCH}
: only required on master:
: CIRCLE_COMPARE_URL to detect SHA1 from last master build: ${CIRCLE_COMPARE_URL}
: CIRCLE_SHA1 to store the current SHA1: ${CIRCLE_SHA1}

# the key file used to restore the cache (from an earlier build)
GIT_RESTORE_FILE=test-cache-git.restore.key
# the key file used to save the cache of the current build
GIT_SAVE_FILE=test-cache-git.save.key

if [[ "${CIRCLE_BRANCH}" == "master" ]]
then
  echo "creating keys for master branch based on CIRCLE_COMPARE_URL:"
  echo "${CIRCLE_SHA1}" > ${GIT_SAVE_FILE}
  if [[ -z "${CIRCLE_COMPARE_URL}" ]]
  then
    # When rebuilding master from the beginning CIRCLE_COMPARE_URL is not provided.
    # We do not want to use any cache. But we need to produce a key file.
    # We use the content of the key file that is used for storing the cache
    # since we know that that cache can not be present
    cat ${GIT_SAVE_FILE} > ${GIT_RESTORE_FILE}
  else
    # take the short hash from the "last green master build" provided by CircleCI
    LAST_SHORT=`expr match "${CIRCLE_COMPARE_URL}" '.*compare\/\([a-f0-9]*\).*'`
    # expanding the short hash to a full one
    git rev-parse "${LAST_SHORT}" > ${GIT_RESTORE_FILE}
  fi
else
  echo "creating keys for branch '${CIRCLE_BRANCH}' based on merge-base:"
  git merge-base HEAD origin/master > ${GIT_RESTORE_FILE}
  cp ${GIT_RESTORE_FILE} ${GIT_SAVE_FILE}
fi

BUILD_SRC_FILE=test-cache-build-src.key
cat ./circle.test-cache-keys.buildSrc.lst | sort | xargs md5sum $1 > ${BUILD_SRC_FILE}
echo ${BUILD_SRC_FILE}:
cat ${BUILD_SRC_FILE}

echo ${GIT_RESTORE_FILE}: `cat ${GIT_RESTORE_FILE}`
echo ${GIT_SAVE_FILE}: `cat ${GIT_SAVE_FILE}`

PER_DAY_FILE=test-cache-date.key
date +%F > ${PER_DAY_FILE}
echo ${PER_DAY_FILE}: `cat ${PER_DAY_FILE}`
