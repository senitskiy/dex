const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXclientContract.js");
const { RContract } = require("./RootTokenContract.js");
const { TTWContract } = require("./TONTokenWalletContract.js");
const hex2ascii = require('hex2ascii');
const fs = require('fs');
// const pathJson = './DEXclientContract.json';
const pathJson = './DEXsetKeys.json';
const networks = ["http://localhost",'net.ton.dev','main.ton.dev'];
const hello = ["Hello localhost TON!","Hello devnet TON!","Hello maitnet TON!"];
const networkSelector = 1;



TonClient.useBinaryLibrary(libNode);

async function main(client) {
  let response;
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });

  response = await clientAcc.runLocal("getAllDataPreparation", {});
  let roots = response.decoded.output.rootKeysR;
  console.log("All connected roots:", roots);
  for (const item of roots) {
    let rootAcc = new Account(RContract, {address:item,client,});
    response = await rootAcc.runLocal("getSymbol", {});
    let symbol = hex2ascii(response.decoded.output.value0)
    console.log('====================');
    response = await clientAcc.runLocal("getWalletByRoot", {rootAddr:item});
    let wallet = response.decoded.output.wallet;
    let walletAcc = new Account(TTWContract, {address:wallet,client,});
    response = await walletAcc.runLocal("getBalance", {});
    let balance = response.decoded.output.value0;
    console.log('balance: '+balance+' nano '+symbol);
  }
  // Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getBalanceTONgrams", {});
  console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output.balanceTONgrams);

}

(async () => {
  const client = new TonClient({network: { endpoints: [networks[networkSelector]],},});
  try {
    console.log(hello[networkSelector]);
    await main(client);
    process.exit(0);
  } catch (error) {
    if (error.code === 504) {
      console.error(`Network is inaccessible. Pls check connection`);
    } else {
      console.error(error);
    }
  }
  client.close();
})();
