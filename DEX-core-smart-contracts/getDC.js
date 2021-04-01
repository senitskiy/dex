const { Account } = require("@tonclient/appkit");
const { libNode } = require("@tonclient/lib-node");
const { Contract } = require("./DEXclientContract.js");
const {
    abiContract,
    signerKeys,
    TonClient,
} = require("@tonclient/core");
const fs = require('fs');
const pathJson = './DEXclientContract.json';


TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
    console.log(`params = ${JSON.stringify(params, null, 2)}`);
    console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}


async function main(client) {

    const contractJson = fs.readFileSync(pathJson,{encoding: "utf8"});
    const contractData = JSON.parse(contractJson);
    const contractAddress = contractData.address;
    const contractKeys = contractData.keys;
    const clientAcc = new Account(Contract, {
        signer: contractKeys,
        client,
    });

    // Execute `showContractAddress` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("showContractAddress", {});
    console.log("Contract reacted to your showContractAddress:", response.decoded.output);
    // Execute `getAllDataPreparation` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("getAllDataPreparation", {});
    console.log("Contract reacted to your getAllDataPreparation:", response.decoded.output);
    // Execute `getAddressWTON` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("getAddressWTON", {});
    console.log("Contract reacted to your getAddressWTON:", response.decoded.output);

}

(async () => {
    const client = new TonClient({
        network: {
            // Local TON OS SE instance URL here
            endpoints: ["http://localhost"],
        },
    });
    try {
        console.log("Hello localhost TON!");
        await main(client);
        process.exit(0);
    } catch (error) {
        if (error.code === 504) {
            console.error(`
Network is inaccessible.
You have to start TON OS SE using \`tondev se start\`
`);
        } else {
            console.error(error);
        }
    }
    client.close();
})();
