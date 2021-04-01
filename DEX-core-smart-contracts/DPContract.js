const fs = require('fs');
const buff = fs.readFileSync('DEXpair.tvc');
const imageBase64 = buff.toString('base64');
const abiJson = './DEXpair.abi.json';
const abi = JSON.parse(fs.readFileSync(abiJson,{encoding: "utf8"}));


module.exports = {
    DPContract: {
        abi: abi,
        tvc: imageBase64,
    }
};
