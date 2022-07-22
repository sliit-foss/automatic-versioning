const exec = require('@actions/exec');

module.exports = ({ command, args }) => {
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
            if (error) console.log(error.red);
            return reject(error);
        })
    })
}