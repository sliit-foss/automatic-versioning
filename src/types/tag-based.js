const run = require('../utils/runner');

module.exports = (name) => {
    const initalVersion = process.env.npm_package_version
    run({ command: 'git', args: [`tag`] }).then((tags) => {
        const latest = tags.split('\n')?.reverse()[1]?.trim()?.replace('v', '')?.replace('_', '-');
        if (latest !== initalVersion) {
            run({ command: 'npm', args: [`version`, latest] }).then(() => {
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
}