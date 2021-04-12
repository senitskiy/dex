const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXrootContract.js");
const fs = require('fs');
const pathJson = './DEXrootContract.json';

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  const contractAddr =  JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const contractKeys =  JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });
  console.log(`DEXroot: ${contractAddr} `);


  // const wTONroot = JSON.parse(fs.readFileSync('./RootTokenContract.json',{encoding: "utf8"})).address;
  // const wTONwrapper = JSON.parse(fs.readFileSync('./TONwrapperContract.json',{encoding: "utf8"})).address;
  // console.log('wTONroot ',wTONroot);
  // console.log('wTONwrapper ',wTONwrapper);

  const dexclientAddr =  JSON.parse(fs.readFileSync('./DEXsetKeys.json',{encoding: "utf8"})).address;
  const dexclientKeys =  JSON.parse(fs.readFileSync('./DEXsetKeys.json',{encoding: "utf8"})).keys;
  let pubkey = '0x'+dexclientKeys.keys.public;
  console.log(`DEXclient computed address: ${dexclientAddr}`);



  const giver = await Account.getGiverForClient(client);
  await giver.sendTo(dexclientAddr, 100_000_000_000_000);
  console.log(`Grams were transferred from giver to ${dexclientAddr}`);
  // await giver.sendTo(dexclientAddr, 100_000_000_000);
  // console.log(`Grams were transferred from giver to ${dexclientAddr}`);


// Call `createDEXclient` function
let response = await clientAcc.run("createDEXclient", {pubkey:pubkey});
console.log("Contract reacted to your createDEXclient:", response.decoded.output);

// // Call `setDEXpairCode` function
// response = await clientAcc.run("setDEXpairCode", {code:Contract.codeDP});
// console.log("Contract reacted to your setDEXpairCode:", response.decoded.output);


// Execute `codeDEXclient` get method  (execute the message locally on TVM)
// response = await clientAcc.runLocal("codeDEXclient", {});
// console.log("Contract reacted to your codeDEXclient:", response.decoded.output);

// Execute `codeDEXpair` get method  (execute the message locally on TVM)
// response = await clientAcc.runLocal("codeDEXpair", {});
// console.log("Contract reacted to your codeDEXpair:", response.decoded.output);



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
