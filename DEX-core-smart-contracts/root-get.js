const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { Account } = require("@tonclient/appkit");
const { libNode } = require("@tonclient/lib-node");
const { Contract } = require("./DEXrootContract.js");
const fs = require('fs');
const pathJson = './DEXrootContract.json';
const networks = ["http://localhost",'net.ton.dev','main.ton.dev'];
const hello = ["Hello localhost TON!","Hello devnet TON!","Hello maitnet TON!"];
const networkSelector = 1;


TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
    console.log(`params = ${JSON.stringify(params, null, 2)}`);
    console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

function getShard(string) {
  return string[2];
}


async function main(client) {
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  console.log(contractAddr);
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });

    const wTONroot = JSON.parse(fs.readFileSync('./RootTokenContract.json',{encoding: "utf8"})).address;
    const wUSDTroot = JSON.parse(fs.readFileSync('./wUSDTContract.json',{encoding: "utf8"})).address;
    const wBTCroot = JSON.parse(fs.readFileSync('./wBTCContract.json',{encoding: "utf8"})).address;
    const wETHroot = JSON.parse(fs.readFileSync('./wETHContract.json',{encoding: "utf8"})).address;

    let keys, pubkey, address, keyJson, path, path1, shard;
    path = './DEXsetKeys.json';





    // // Execute `createDEXpair`
    // response = await clientAcc.run("createDEXpair", {pubkey:pubkey,root0:wTONroot,root1:wUSDTroot});
    // console.log("Contract reacted to your createDEXpair:", response.decoded.output);
    //
    // // Execute `getPairByRoots01` get method  (execute the message locally on TVM)
    // response = await clientAcc.runLocal("getPairByRoots01", {root0:wTONroot,root1:wUSDTroot});
    // console.log("Contract reacted to your getPairByRoots01:", response.decoded.output);
    //
    // // Execute `getPairByRoots10` get method  (execute the message locally on TVM)
    // response = await clientAcc.runLocal("getPairByRoots10", {root1:wUSDTroot, root0:wTONroot});
    // console.log("Contract reacted to your getPairByRoots10:", response.decoded.output);

    // Execute `getBalanceTONgrams` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("getBalanceTONgrams", {});
    console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output);

    // Execute `wrappedTONroot` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("wrappedTONroot", {});
    console.log("Contract reacted to your wrappedTONroot:", response.decoded.output);

    // Execute `TONwrapper` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("TONwrapper", {});
    console.log("Contract reacted to your TONwrapper:", response.decoded.output);

    // Execute `pairs` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("pairs", {});
    console.log("Contract reacted to your pairs:", response.decoded.output);

    // Execute `pairKeys` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("pairKeys", {});
    console.log("Contract reacted to your pairKeys:", response.decoded.output);

    // Execute `clients` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("clients", {});
    console.log("Contract reacted to your clients:", response.decoded.output);

    // Execute `clientKeys` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("clientKeys", {});
    console.log("Contract reacted to your clientKeys:", response.decoded.output);

    // Execute `test1` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("test1", {});
    console.log("Contract reacted to your test1:", response.decoded.output);

    // Execute `test2` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("test2", {});
    console.log("Contract reacted to your test2:", response.decoded.output);

    // Execute `test2` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("test3", {});
    console.log("Contract reacted to your test3:", response.decoded.output);

    // Execute `test2` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("test4", {});
    console.log("Contract reacted to your test4:", response.decoded.output);

    // Execute `test2` get method  (execute the message locally on TVM)
    response = await clientAcc.runLocal("test5", {});
    console.log("Contract reacted to your test5:", response.decoded.output);

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
