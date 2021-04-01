const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXclientContract.js");
const fs = require('fs');
const pathJson = './DEXclientContract.json';

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const clientAcc = new Account(Contract, {
    signer: contractKeys,
    client,
  });

  const pairTONxUSDT = JSON.parse(fs.readFileSync('./DEXpairTONxUSDT.json',{encoding: "utf8"})).address;
  const pairTONxBTC = JSON.parse(fs.readFileSync('./DEXpairTONxBTC.json',{encoding: "utf8"})).address;
  const pairTONxETH = JSON.parse(fs.readFileSync('./DEXpairTONxETH.json',{encoding: "utf8"})).address;
  const pairBTCxUSDT = JSON.parse(fs.readFileSync('./DEXpairBTCxUSDT.json',{encoding: "utf8"})).address;
  const pairETHxUSDT = JSON.parse(fs.readFileSync('./DEXpairETHxUSDT.json',{encoding: "utf8"})).address;

  // Call `connectPair` function
  let response = await clientAcc.run("connectPair", {pairAddr:pairTONxUSDT});
  console.log('Contract run connectPair with output', response.decoded.output, response.transaction.id);

  // Call `connectPair` function
  response = await clientAcc.run("connectPair", {pairAddr:pairTONxBTC});
  console.log('Contract run connectPair with output', response.decoded.output, response.transaction.id);

  // Call `connectPair` function
  response = await clientAcc.run("connectPair", {pairAddr:pairTONxETH});
  console.log('Contract run connectPair with output', response.decoded.output, response.transaction.id);

  // Call `connectPair` function
  response = await clientAcc.run("connectPair", {pairAddr:pairBTCxUSDT});
  console.log('Contract run connectPair with output', response.decoded.output, response.transaction.id);

  // Call `connectPair` function
  response = await clientAcc.run("connectPair", {pairAddr:pairETHxUSDT});
  console.log('Contract run connectPair with output', response.decoded.output, response.transaction.id);

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
