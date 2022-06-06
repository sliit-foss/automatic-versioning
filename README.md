# automatic-versioning

A script which will automatically increment your app package version in accordance with conventional commits

---
## Why automatic-versioning

- Most version bumping scripts only focus on just the version bumping. **automatic-versioning** takes into account your git changes and automatically increments the version number based on your last commit message only if there are changes in your directory, a feature which is highly useful in monorepos.

- **automatic-versioning** by default, skips version bumping for special commits such as merge commits.

---

## Prerequisites
- [Git](https://git-scm.com/) installed and configured

## Installation

```js
# using npm
npm install automatic-versioning

# using yarn
yarn add automatic-versioning
```

## Usage

- Add the following script to your package.json<br/>
```js
  "scripts": {
      "bump-version": "yarn --cwd ./node_modules/automatic-versioning/ run bump-version --name=<package_name>"
  } 
```
- then:

```js
# using npm
npm run bump-version

# using yarn
yarn bump-version
```

## Usage with commitlint and husky<br/>

- ### Install the following dependencies
```js
  "dependencies": {
    "@commitlint/cli": "^17.0.1",
    "@commitlint/config-conventional": "^17.0.0",
    "husky": "^4.3.8"
  }
```

- ### Add the following to your package.json<br/>
```js
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  },
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "post-commit": "HUSKY_SKIP_HOOKS=1 yarn bump-version",
    }
  },
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ]
  }
```

## Commit message prefixes and associated version bumping

  ```js
      - feat! - bump major version
  ```
  ```js
      - feat  - bump minor version
  ```
  ```js
      - fix   - bump patch version
  ```

## Disable version bumping for specific commit<br/><br/>

- Add the following to your commit message: "--no-bump"<br/>
```js
  // example command
  git commit -m "feat: some feature --no-bump"
```

## Custom app directory to run incrementing script<br/><br/>

- Add the following argument to your bump script: "--rootDir=<custom_dir>"<br/>
```js
  // example script:
  yarn --cwd ./node_modules/automatic-versioning/ run bump-version --name=<package_name> --rootDir=<custom_dir>
```