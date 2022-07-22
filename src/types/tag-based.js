const run = require('../utils/runner');

module.exports = (name) => {
    run({ command: 'npm', args: [`pkg`, 'get', 'version'] }).then((initialVersion) => {
        initialVersion = initialVersion.replace(/\n/g, '')?.replaceAll('\"', '')?.trim()
        run({ command: 'git', args: [`tag`, '--sort=committerdate'] }).then((tags) => {
            let latest = tags.split('\n')?.reverse()[1]?.trim()?.replace('v', '')?.replaceAll('_', '-');
            if (latest && /[0-9]{1,4}.[0-9]{1,2}.[0-9]{1,2}.rc/.test(latest)) {
                latest = latest?.split('.')
                latest = `${parseInt(latest[0])}.${parseInt(latest[1])}.${parseInt(latest[2])}-${latest[3]}`
            }
            if (latest && latest !== initialVersion) {
                run({ command: 'npm', args: [`version`, latest, '--no-git-tag-version'] }).then(() => {
                    run({ command: 'git', args: [`add`, '.'] }).then(() => {
                        run({ command: 'git', args: [`commit`, '--amend', '--no-edit'] }).then(() => {
                            console.log(`Bumped version of ${name} from ${initialVersion} to ${latest}`.green);
                        })
                    })
                }).catch(() => { })
            } else {
                console.log(`No tag diff found, skipping version bump for ${name}`.yellow);
            }
        })
    })

}