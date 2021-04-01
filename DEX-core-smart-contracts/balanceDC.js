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
  let response;
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const clientAcc = new Account(Contract, {
    signer: contractKeys,
    client,
  });

  const pairTONxUSDT = JSON.parse(fs.readFileSync('./DEXpairTONxUSDT.json',{encoding: "utf8"})).address;
  // Call `getPairClientWallets` function
  response = await clientAcc.runLocal("getPairClientWallets", {pairAddr:pairTONxUSDT});
  let walletTON = new Account(TTWContract, {address: response.decoded.output.walletA,client,});
  let walletUSDT = new Account(TTWContract, {address: response.decoded.output.walletB,client,});
  response = await walletTON.runLocal("getBalance", {});
  let balanceTON = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance  TON:", balanceTON);
  response = await walletUSDT.runLocal("getBalance", {});
  let balanceUSDT = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance USDT:", balanceUSDT);

  const pairTONxBTC = JSON.parse(fs.readFileSync('./DEXpairTONxBTC.json',{encoding: "utf8"})).address;
  // Call `getPairClientWallets` function
  response = await clientAcc.runLocal("getPairClientWallets", {pairAddr:pairTONxBTC});
  let walletBTC = new Account(TTWContract, {address: response.decoded.output.walletB,client,});
  response = await walletBTC.runLocal("getBalance", {});
  let balanceBTC = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance BTC:", balanceBTC);

  const pairTONxETH = JSON.parse(fs.readFileSync('./DEXpairTONxETH.json',{encoding: "utf8"})).address;
  // Call `getPairClientWallets` function
  response = await clientAcc.runLocal("getPairClientWallets", {pairAddr:pairTONxETH});
  // console.log('Contract run getPairClientWallets with output', response.decoded.output);
  let walletETH = new Account(TTWContract, {address: response.decoded.output.walletB,client,});
  response = await walletETH.runLocal("getBalance", {});
  let balanceETH = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance ETH:", balanceETH);
  // Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getBalanceTONgrams", {});
  console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output.balanceTONgrams);

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
