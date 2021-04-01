const fs = require('fs');
const buff = fs.readFileSync('DEXclient.tvc');
const imageBase64 = buff.toString('base64');
const abiJson = './DEXclient.abi.json';
const abi = JSON.parse(fs.readFileSync(abiJson,{encoding: "utf8"}));

module.exports = {
    Contract: {
        abi: abi,
        tvc: imageBase64,
    }
};
