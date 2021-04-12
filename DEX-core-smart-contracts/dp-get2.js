const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXpairContract.js");
const fs = require('fs');
const pathJson = './DEXpairTONxBTC.json';

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });

// Execute `getPair` get method  (execute the message locally on TVM)
response = await clientAcc.runLocal("getPair", {});
console.log("Contract reacted to your getPair:", response.decoded.output);

// Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
response = await clientAcc.runLocal("getBalanceTONgrams", {});
console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output);

const clientAddr = JSON.parse(fs.readFileSync('./DEXclientContract.json',{encoding: "utf8"})).address;
// Execute `getClient` get method  (execute the message locally on TVM)
response = await clientAcc.runLocal("getClient", {dexclient:clientAddr});
console.log("Contract reacted to your getClient:", response.decoded.output);


// Execute `getAddressWTON` get method  (execute the message locally on TVM)
// response = await clientAcc.runLocal("getAddressWTON", {});

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
