const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXclientContract.js");
const { TTWContract } = require("./TONTokenWalletContract.js");
const fs = require('fs');
const pathJson = './DEXclientContract.json';

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const clientAcc = new Account(Contract, {
    signer: contractKeys,
    client,
  });


  let response;
  // Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getBalanceTONgrams", {});
  console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output.balanceTONgrams);

  // Execute `getAddressWTON` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getAddressWTON", {});
  console.log("Contract reacted to your getAddressWTON:", response.decoded.output.wallet);

  let walletAddr = response.decoded.output.wallet;
  const walletAcc = new Account(TTWContract, {
    address: walletAddr,
    client,
  });
  // Execute `getBalance` get method  (execute the message locally on TVM)
  response = await walletAcc.runLocal("getBalance", {});
  console.log("Contract reacted to your getBalance:", response.decoded.output);

  let ton = 30000000000000000;
  let fee = 1399000;
  let tonprovide = ton + fee;

  const giver = await Account.getGiverForClient(client);
  await giver.sendTo(contractAddr, 30_000_000_000_000_000);
  console.log(`Grams were transferred from giver to ${contractAddr}`);

  // Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
  // response = await clientAcc.runLocal("getBalanceTONgrams", {});
  // console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output.balanceTONgrams);

  // Execute `getBalance` get method  (execute the message locally on TVM)
  // response = await walletAcc.runLocal("getBalance", {});
  // console.log("Contract reacted to your getBalance:", response.decoded.output);

  // Call `wrapTON` function
  response = await clientAcc.run("wrapTON", {qtyTONgrams:tonprovide});
  console.log('Contract run wrapTON with output', response.decoded.output, response.transaction.id);

  // Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
  // response = await clientAcc.runLocal("getBalanceTONgrams", {});
  // console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output.balanceTONgrams);

  // Execute `getBalance` get method  (execute the message locally on TVM)
  // response = await walletAcc.runLocal("getBalance", {});
  // console.log("Contract reacted to your getBalance:", response.decoded.output);



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
