const fs = require('fs');
const buff = fs.readFileSync('RootTokenContract.tvc');
const imageBase64 = buff.toString('base64');
const abiJson = './RootTokenContract.abi.json';
const abi = JSON.parse(fs.readFileSync(abiJson,{encoding: "utf8"}));

module.exports = {
    RContract: {
        abi: abi,
        tvc: imageBase64,
    }
};
