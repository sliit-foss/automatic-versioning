
const colors = require('colors');
const path = require("path");

const defaultRunner = require('./types/default');
const tagBasedRunner = require('./types/tag-based');

const args = process.argv.slice(2);

let name = 'app'
let runFromRoot = false
let rootDir = '../../../'
let noCommitEdit = false

args.forEach((arg) => {
  if (arg.includes('--name=')) name = arg.replace('--name=', '');
  if (arg.includes('--run-from-root')) runFromRoot = true
  if (arg.includes('--rootDir=')) rootDir += arg.replace('--rootDir=', '');
  if (arg.includes('--no-commit-edit')) noCommitEdit = true
})

console.log(`Running version bump for ${name}`.green);

if (!runFromRoot) {
  const parentDir = path.resolve(__dirname, rootDir);
  process.chdir(parentDir);
}

if (args.includes('--tag-based')) {
  tagBasedRunner(name, noCommitEdit);
} else {
  defaultRunner(name, noCommitEdit);
}


