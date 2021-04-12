const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { Account } = require("@tonclient/appkit");
const { libNode } = require("@tonclient/lib-node");
const { Contract } = require("./DEXclientContract.js");
const fs = require('fs');
// const pathJson = './DEXclientContract.json';
const pathJson = './DEXsetKeys.json';



TonClient.useBinaryLibrary(libNode);


async function main(client) {

  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  console.log(contractAddr);
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });

    // Execute `showContractAddress` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("showContractAddress", {});
    console.log("Contract reacted to your showContractAddress:", response.decoded.output);
    // Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("getBalanceTONgrams", {});
    console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output);

    // Execute `rootDEX` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("rootDEX", {});
    console.log("Contract reacted to your rootDEX:", response.decoded.output);

    // Execute `wTONroot` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("wTONroot", {});
    console.log("Contract reacted to your wTONroot:", response.decoded.output);

    // Execute `wTONwrapper` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("wTONwrapper", {});
    console.log("Contract reacted to your wTONwrapper:", response.decoded.output);

    // Execute `getAllDataPreparation` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("getAllDataPreparation", {});
    console.log("Contract reacted to your getAllDataPreparation:", response.decoded.output);
    // Execute `getAddressWTON` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("getAddressWTON", {});
    console.log("Contract reacted to your getAddressWTON:", response.decoded.output);

    response = await clientAcc.runLocal("test1", {});
    console.log("Contract reacted to your test1:", response.decoded.output);

    response = await clientAcc.runLocal("test2", {});
    console.log("Contract reacted to your test2:", response.decoded.output);

    response = await clientAcc.runLocal("test3", {});
    console.log("Contract reacted to your test3:", response.decoded.output);


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
