const exec = require('@actions/exec');

const args = process.argv.slice(2);

let name = 'app'

if (args.length > 0) {
  name = args[0].replace('--name=', '');
}

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

run({command: 'git', args: [`show`, `./`]}).then((diff) => {
  if (diff) {
    console.log(`Diff found, running post-commit for ${name}`);
    run({command: 'git', args: ['log', '-1']}).then((res) => {
      const initalVersion = process.env.npm_package_version
      const version = {
        major: Number(initalVersion.split('.')[0]),
        minor: Number(initalVersion.split('.')[1]),
        patch: Number(initalVersion.split('.')[2])
      }
      const commitMessage = res.split('\n')[4].trim();
      const changeType = commitMessage.split(':')[0].trim();
      if (changeType.toLowerCase() == 'feature!' || changeType.toLowerCase() == 'feat!' || changeType.toLowerCase() == 'f!') {
          version.major++;
          version.minor = 0;
          version.patch = 0;
      } else if (changeType.toLowerCase() == 'feature' || changeType.toLowerCase() == 'feat' || changeType.toLowerCase() == 'f') {
        version.minor++;
        version.patch = 0;
      } else {
        version.patch++;
      }
      run({command: 'npm', args: [`version`, `${version.major}.${version.minor}.${version.patch}`]}).then(() => {
        const successMsg = `Bumped version of ${name} from ${initalVersion} to ${version.major}.${version.minor}.${version.patch}`
        run({command: 'git', args: [`add`, '.']}).then(() => {
          run({command: 'git', args: [`commit`, '-m', `${successMsg}`]}).then(() => {
            console.log(successMsg);
          })
        })
      })
    })
  } else {
    console.log(`No diff found, skipping post-commit for ${name}`);
  }
})

