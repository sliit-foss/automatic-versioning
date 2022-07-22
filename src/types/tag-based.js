const run = require('../utils/runner');

module.exports = (name) => {
    run({ command: 'npm', args: [`pkg`, 'get', 'version'] }).then((initialVersion) => {
        initialVersion = initialVersion.replace(/\n/g, '')?.replaceAll('\"', '')?.trim()
        run({ command: 'git', args: [`tag`, '--sort=committerdate'] }).then((tags) => {
            let latest = tags.split('\n')?.reverse()[1]?.trim()?.replace('v', '')?.replaceAll('_', '-');
            if (/[0-9]{1,4}.[0-9\-]{1,2}.[0-9\-]{1,3}.rc/.test(initialVersion) && latest) {
                latest = latest?.split('.')
                latest = `${parseInt(latest[0])}.${parseInt(latest[1])}.${parseInt(latest[2])}-${latest[3]}`
            }
            if (latest && latest !== initialVersion) {
                run({ command: 'npm', args: [`version`, latest, '--no-git-tag-version'] }).then(() => {
                    const successMsg = `Bumped version of ${name} from ${initialVersion} to ${latest}`
                    run({ command: 'git', args: [`add`, '.'] }).then(() => {
                        run({ command: 'git', args: [`commit`, '-m', `${successMsg}`] }).then(() => {
                            run({ command: 'git', args: [`status`] }).then((status) => {
                                const currentBranch = status.split('\n')[0]?.split(' ')[2];
                                run({ command: 'git', args: [`push`, 'origin', currentBranch] }).then(() => {
                                    console.log(successMsg.green);
                                })
                            })
                        })
                    })
                }).catch(() => {})
            } else {
                console.log(`No tag diff found, skipping version bump for ${name}`.yellow);
            }
        })
    })

}