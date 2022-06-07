const path = require("path");
const exec = require('@actions/exec');

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

console.log(`Running post-commit for ${name}`);

const run = ({command, args}) => {
  return new Promise((resolve, reject) => {
    let output = '';
    let err = '';
    exec.exec(command, args, {
      listeners: {
        stdout: (data) => {
          output += data.toString();
        },
        stderr: (data) => {
          err += data.toString();
        }
      }
    }).then(() => {
      return resolve(output);
    }).catch((error) => {
      console.log(error);
      return reject(error);
    })
  })
}

if (!runFromRoot) {
  const parentDir = path.resolve(__dirname, rootDir);
  process.chdir(parentDir);
}

run({command: 'git', args: [`show`, `./`]}).then((diff) => {
  if (diff) {
    console.log(`Diff found, running post-commit for ${name}`);
    run({command: 'git', args: ['log', '-1']}).then((res) => {
      const commitMessage = res.split('\n')[4].trim();
      if (!commitMessage.startsWith('Merge')) {
        if (!commitMessage.startsWith('Revert')) {
          if (!commitMessage.includes('--no-bump')) {
            const changeType = commitMessage.split(':')[0].trim();
            let versionUpdate = 'patch';
            if (changeType.toLowerCase() == 'feature!' || changeType.toLowerCase() == 'feat!' || changeType.toLowerCase() == 'f!') {
              versionUpdate = 'major';
            } else if (changeType.toLowerCase() == 'feature' || changeType.toLowerCase() == 'feat' || changeType.toLowerCase() == 'f') {
              versionUpdate = 'minor';
            }
            run({command: 'npm', args: [`--no-git-tag-version`, `version`, versionUpdate]}).then(() => {
              const successMsg = `${commitMessage[0] == commitMessage[0].toUpperCase() ? 'B' : 'b'}umped version of ${name} to match latest ${versionUpdate} release`
              run({command: 'git', args: [`add`, '.']}).then(() => {
                run({command: 'git', args: [`commit`, '-m', `${successMsg}`]}).then(() => {
                  console.log(successMsg);
                })
              })
            })
          } else {
            if (noCommitEdit) {
              console.log(`No bump found in commit message, skipping version bump`);
            } else {
              console.log(`No bump found in commit message, skipping version bump and editing commit message`);
              run({command: 'git', args: [`commit`, '--amend', '-m', `${commitMessage.replaceAll('--no-bump', '')}`]}).then(() => {
                console.log('Successfully edited commit message');
              })
            }
          }
        } else {
          console.log(`Revert commit found, skipping version bump`);
        }
      } else {
        console.log(`Merge commit found, skipping version bump`);
      }
    })
  } else {
    console.log(`No diff found, skipping post-commit for ${name}`);
  }
})

