const fs = require('fs');
const buff = fs.readFileSync('TONwrapper.tvc');
const imageBase64 = buff.toString('base64');
const abiJson = './TONwrapper.abi.json';
const abi = JSON.parse(fs.readFileSync(abiJson,{encoding: "utf8"}));

module.exports = {
    TWContract: {
        abi: abi,
        tvc: imageBase64,
    }
};
