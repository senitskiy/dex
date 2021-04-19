const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { TWContract } = require("./TONwrapperContract.js");
const fs = require('fs');
const pathJsonTW = './TONwrapperContract.json';
const hex = require('ascii-hex');
const networks = ["http://localhost",'net.ton.dev','main.ton.dev'];
const hello = ["Hello localhost TON!","Hello devnet TON!","Hello maitnet TON!"];
const networkSelector = 1;

function toHex(input) {
  let output = '';
  for (i = 0; i < input.length; i ++){output += hex(input[i]).toString(16)}
  return String(output);
}

TonClient.useBinaryLibrary(libNode);

async function main(client) {
  let response;
  const wraperAbi = {
    type: 'Contract',
    value: TWContract.abi
  }


  const  wrapperKeys = JSON.parse(fs.readFileSync(pathJsonTW,{encoding: "utf8"})).keys;
  const  wrapperAddr = JSON.parse(fs.readFileSync(pathJsonTW,{encoding: "utf8"})).address;
  const wrapperAcc = new Account(TWContract, {
    address: wrapperAddr,
    signer: wrapperKeys,
    client,
  });

// Execute `getZeroAddress` get method  (execute the message locally on TVM)
response = await wrapperAcc.runLocal("getZeroAddress", {});
console.log("Contract reacted to your getZeroAddress:", response.decoded.output);

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
