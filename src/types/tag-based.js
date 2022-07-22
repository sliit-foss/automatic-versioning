const run = require('../utils/runner');

module.exports = (name) => {
    run({ command: 'npm', args: [`pkg`, 'get', 'version'] }).then((initalVersion) => {
        initalVersion = initalVersion.replace(/\n/g, '')?.replaceAll('\"', '')?.replaceAll('-', '')?.trim();
        run({ command: 'git', args: [`tag`] }).then((tags) => {
            const latest = tags.split('\n')?.reverse()[1]?.trim()?.replace('v', '')?.replace('_', '').replace('-', '');
            console.log(`Latest version: ${latest}`);
            console.log(`inital version: ${initalVersion}`);
            if (latest !== initalVersion) {
                run({ command: 'npm', args: [`version`, latest, '--allow-same-version', '--no-git-tag-version'] }).then(() => {
                    const successMsg = `Bumped version of ${name} from ${initalVersion} to ${latest}`
                    run({ command: 'git', args: [`add`, '.'] }).then(() => {
                        run({ command: 'git', args: [`commit`, '-m', `${successMsg}`] }).then(() => {
                            console.log(successMsg.green);
                        })
                    })
                })
            } else {
                console.log(`No tag diff found, skipping version bump for ${name}`.yellow);
            }
        })
    })

}