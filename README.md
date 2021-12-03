# Live Captioning React Project
--------
- Project for building a real time captioning system.

# Project deployment:
--------
- If using nvm as node manager, just go to project root folder and type `nvm use`
- Project is deployed on firebase hosting with Dev and Production environments in two different projects.
  
- To Deploy project:
  - npm run deploy 
 
# Deployment targets
-----------
- It is recommended to configure two separate firebase projects for production and development purposes. 
- You can configure two environments for project on firebase.
  - your-project-development
  - your-project-production
- FIREBASE_ENV environment variables, help to pick which firebase environment app should be build for & deployed.
  - `npm run build:fbdev`: Builds app to deploy on firebase dev environment
  - `npm run build:fbprod`: Builds app to deploy on firebase prod environment.


## Upgrading unsafe packages

1. Check for unsafe packages `npm audit`
2. Update everything that is supposed not to be a breaking change `npm audit fix`
3. Test, adjust the code accordingly & commit
4. update breaking changes `npm audit fix --force`
5. Test, adjust the code accordingly & commit
6. Take care manually of what's left, by running `npm audit` again and check on the nodesecurity.io link

## Upgrading dependencies

1. check for outdated packages (`npm run check` or `npx npm-check -u --skip-unused`)
   1. by copy pasting the output of this comment to a temporary file nd some formatting a nice report of the upgrades can be generated
   2. upgrade outdated package by selecting the packages to update
      **Please make sure you keep the range specifiers!**
2. run tests and apps and see if everything still works
3. adjust our code to work with the new apis
4. repeat from 1. until no outdated packages are left
5. remove `package-lock.json` and node_modules
6. npm install
7. fix errors
8. you're ready for a pull request!
   - For things that have not been upgraded either mention them and the problems you had or even create a issue or ticket for them

## Upgrading Node version

make sure to change:

- `circle.yml`
- `package.json`
- `.nvmrc`
