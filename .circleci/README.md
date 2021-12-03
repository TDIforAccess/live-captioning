<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Generated TOC**

- [Current Setup:](#current-setup)
  - [Workflow `build-and-deploy`:](#workflow-build-and-deploy)
  - [Caching](#caching)
    - [TLDR:](#tldr)
- [testing jobs locally](#testing-jobs-locally)
  - [TLDR;](#tldr)
    - [Installing cli tool `circleci`](#installing-cli-tool-circleci)
    - [Validating yaml file:](#validating-yaml-file)
    - [Executing a job locally:](#executing-a-job-locally)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Current Setup:
  Scripts that are used in the config are placed in the project root and start with `circle.`. 

### Workflow `build-and-deploy`:  
  runs the following jobs in order
  * `build` 
  * `deployment` (only when branch is master)

### Caching
  Documentation about the topic: https://circleci.com/docs/2.0/caching/
  
  #### TLDR:
  
  - Caches are created identified by the following schema: `version-name-keyA[-keyB]*`.
  - Every cache id is unique across all builds ad workflows of a repository
  - Every cache can only be written once
  - *Partial cache hits* can be used to restore "older" caches that are still more helpful then starting from scratch. For a cache to match it has to start with the requested cache id. (In case of multiple hits the latest one is used.) 
  - Each cache key is prefixed with `vN-` so it is easy to increment the version to start without a cache.
  
  - Files that are used for creating parts  of a cache key are generated into the project root and have the extension `.key`. This way they are ignored by git.
  
  #### repo-cache
  
  - The whole repository is `saved` into this cache directly after `checkout`.
  - A new cache is created for each commit that has been pushed.
  
  #### dependency-cache
  
  - The folder `node_modules/` is put into this cache.
  - The only key is the `checksum` of a copy of the `package-lock.json` file,
    so that the key can not affected by running `npm install`.
  - The `restore_cache` and `save_cache` are wrapping `npm install`
  - This cache is used by the image tests to restore `node_modules` instead of running `npm install` again
  
  #### test-cache
  - The folder `.cache/` is put into this cache.
  - This way there is a fine speed up for running `npm test`.
  - The id is created using the following keys:
    1. a checksum over all files listed in `circle.test-cache-keys.buildSrc.lst`  
       This way things that influence the test run from the "build" perspective invalidate the cache.
    2. the "last relevant" git commit (see below for what that means)
    3. the branch name
    4. the date in the format `YYYY-MM-DD`  
       This way the first run each day creates the cache,
       that will be used as a snapshot for that day.
    
  - The `restore_cache` and `save_cache` are wrapping `npm test:ci`.
    * For restoring the "last relevant" git commit is used,
      and partial cache hits are used to get the newest possible cache. 
    * On master the current commit is used for saving, otherwise the merge-base.
    
    This means a successfull build on master prepares the cache for all branches that will rebase onto that master.
    
  For the master branch the "last relevant commit" is the one that caused the last build on master. This information is available vie the ENV variable `CIRCLE_COMPARE_URL` that is provided by CircleCI
  For all other branches we are using the `merge-base` (the last commit the branch has in common with `origin/master`) as a reference point.


## testing jobs locally

[Full documentation](https://circleci.com/docs/2.0/local-jobs/)

### TLDR;

#### Installing cli tool `circleci`
```
curl -o /usr/local/bin/circleci https://circle-downloads.s3.amazonaws.com/releases/build_agent_wrapper/circleci && chmod +x /usr/local/bin/circleci
```

#### Validating yaml file:
```
circleci config validate -c .circleci/config.yml
```

#### Executing a job locally:

- Change to root path of the project.
- Execute `circleci build`
