const run = require('../utils/runner');

module.exports = (name) => {
    run({ command: 'npm', args: [`pkg`, 'get', 'version'] }).then((initialVersion) => {
        initialVersion = initialVersion.replace(/\n/g, '')?.replaceAll('\"', '')?.trim();
        if (/[0-9]{4}.[0-9]{2}.[0-9]{2}.rc/.test(initialVersion)) initialVersion = initialVersion?.replaceFirst('-', '')
        run({ command: 'git', args: [`tag`, '--sort=committerdate'] }).then((tags) => {
            const latest = tags.split('\n')?.reverse()[1]?.trim()?.replace('v', '')?.replace('_', '-');
            if (latest && latest !== initialVersion) {
                run({ command: 'npm', args: [`version`, latest, '--allow-same-version', '--no-git-tag-version'] }).then(() => {
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
                })
            } else {
                console.log(`No tag diff found, skipping version bump for ${name}`.yellow);
            }
        })
    })

}