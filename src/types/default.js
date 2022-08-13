const run = require('../utils/runner');

module.exports = (name, noCommitEdit) => {
    run({ command: 'git', args: [`show`, `./`] }).then((diff) => {
        if (diff) {
            console.log(`Diff found, running post-commit for ${name}`.green);
            run({ command: 'git', args: ['log', '-1'] }).then((res) => {
                const commitMessage = res.split('\n')[4].trim();
                if (!commitMessage.startsWith('Merge')) {
                    if (!commitMessage.startsWith('Revert')) {
                        if (!commitMessage.includes('--no-bump')) {
                            const changeType = commitMessage.split(':')[0].trim();
                            let versionUpdate;
                            if (changeType.toLowerCase() == 'feature!' || changeType.toLowerCase() == 'feat!' || changeType.toLowerCase() == 'f!') {
                                versionUpdate = 'major';
                            } else if (changeType.toLowerCase() == 'feature' || changeType.toLowerCase() == 'feat' || changeType.toLowerCase() == 'f') {
                                versionUpdate = 'minor';
                            } else if (changeType.toLowerCase() == 'fix') {
                                versionUpdate = 'patch';
                            } else {
                                console.log(`No commit prefix found in commit message, skipping version bump`.yellow);
                                return
                            }
                            run({ command: 'npm', args: [`--no-git-tag-version`, `version`, versionUpdate] }).then(() => {
                                const successMsg = `${commitMessage[0] == commitMessage[0].toUpperCase() ? 'B' : 'b'}umped version of ${name} to match latest ${versionUpdate} release`
                                run({ command: 'git', args: [`add`, '.'] }).then(() => {
                                    run({ command: 'git', args: [`commit`, '-m', `${successMsg}`] }).then(() => {
                                        console.log(successMsg.green);
                                    })
                                })
                            })
                        } else {
                            if (noCommitEdit) {
                                console.log(`No bump found in commit message, skipping version bump`.yellow);
                            } else {
                                console.log(`No bump found in commit message, skipping version bump and editing commit message`.yellow);
                                run({ command: 'git', args: [`commit`, '--amend', '-m', `${commitMessage.replaceAll('--no-bump', '')}`] }).then(() => {
                                    console.log('Successfully edited commit message'.green);
                                })
                            }
                        }
                    } else {
                        console.log(`Revert commit found, skipping version bump`.yellow);
                    }
                } else {
                    console.log(`Merge commit found, skipping version bump`.yellow);
                }
            })
        } else {
            console.log(`No diff found, skipping version bump for ${name}`.yellow);
        }
    })
}