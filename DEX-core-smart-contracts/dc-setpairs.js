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

  const giver = await Account.getGiverForClient(client);
  await giver.sendTo(contractAddr, 60_000_000_000);
  console.log(`Grams were transferred from giver to ${contractAddr}`);


  let pairsArr = JSON.parse(fs.readFileSync('./DEXsetPairs.json',{encoding: "utf8"})).pairsArr;
  let createIdArr = JSON.parse(fs.readFileSync('./DEXsetPairs.json',{encoding: "utf8"})).createIdArr;
  // console.log(pairsArr);
  // console.log(createIdArr);
  const wTONroot = JSON.parse(fs.readFileSync('./RootTokenContract.json',{encoding: "utf8"})).address;
  const wUSDTroot = JSON.parse(fs.readFileSync('./wUSDTContract.json',{encoding: "utf8"})).address;
  const wBTCroot = JSON.parse(fs.readFileSync('./wBTCContract.json',{encoding: "utf8"})).address;
  const wETHroot = JSON.parse(fs.readFileSync('./wETHContract.json',{encoding: "utf8"})).address;

  if (!(createIdArr.length<5)){
    let response, pairJson, pairPath, id;

    response = await clientAcc.runLocal("test1", {});
    console.log("Contract reacted to your test1:", response.decoded.output);

    response = await clientAcc.runLocal("test2", {});
    console.log("Contract reacted to your test2:", response.decoded.output);

    response = await clientAcc.runLocal("test3", {});
    console.log("Contract reacted to your test3:", response.decoded.output);

    id = 0;
    pairPath = './DEXpairTONxUSDT.json';
    // Execute `createWrappedTONwallet` get method  (execute the message locally on TVM)
    response = await clientAcc.run("createNewPairByOwner", {root0:wTONroot,root1:wUSDTroot,createId:createIdArr[id],grams:12000000000});
    console.log("Contract reacted to your createNewPairByOwner:", response.decoded.output);
    pairJson = JSON.stringify({address:pairsArr[id], keys:contractKeys});
    fs.writeFileSync( pairPath, pairJson,{flag:'w'});
    console.log("Pair address  and keys written successfully to:", pairPath);
    id = 1;
    pairPath = './DEXpairTONxBTC.json';
    // Execute `createWrappedTONwallet` get method  (execute the message locally on TVM)
    response = await clientAcc.run("createNewPairByOwner", {root0:wTONroot,root1:wBTCroot,createId:createIdArr[id],grams:12000000000});
    console.log("Contract reacted to your createNewPairByOwner:", response.decoded.output);
    pairJson = JSON.stringify({address:pairsArr[id], keys:contractKeys});
    fs.writeFileSync( pairPath, pairJson,{flag:'w'});
    console.log("Pair address  and keys written successfully to:", pairPath);
    id = 2;
    pairPath = './DEXpairTONxETH.json';
    // Execute `createWrappedTONwallet` get method  (execute the message locally on TVM)
    response = await clientAcc.run("createNewPairByOwner", {root0:wTONroot,root1:wETHroot,createId:createIdArr[id],grams:12000000000});
    console.log("Contract reacted to your createNewPairByOwner:", response.decoded.output);
    pairJson = JSON.stringify({address:pairsArr[id], keys:contractKeys});
    fs.writeFileSync( pairPath, pairJson,{flag:'w'});
    console.log("Pair address  and keys written successfully to:", pairPath);
    id = 3;
    pairPath = './DEXpairBTCxUSDT.json';
    // Execute `createWrappedTONwallet` get method  (execute the message locally on TVM)
    response = await clientAcc.run("createNewPairByOwner", {root0:wBTCroot,root1:wUSDTroot,createId:createIdArr[id],grams:12000000000});
    console.log("Contract reacted to your createNewPairByOwner:", response.decoded.output);
    pairJson = JSON.stringify({address:pairsArr[id], keys:contractKeys});
    fs.writeFileSync( pairPath, pairJson,{flag:'w'});
    console.log("Pair address  and keys written successfully to:", pairPath);
    id = 4;
    pairPath = './DEXpairETHxUSDT.json';
    // Execute `createWrappedTONwallet` get method  (execute the message locally on TVM)
    response = await clientAcc.run("createNewPairByOwner", {root0:wETHroot,root1:wUSDTroot,createId:createIdArr[id],grams:12000000000});
    console.log("Contract reacted to your createNewPairByOwner:", response.decoded.output);
    pairJson = JSON.stringify({address:pairsArr[id], keys:contractKeys});
    fs.writeFileSync( pairPath, pairJson,{flag:'w'});
    console.log("Pair address  and keys written successfully to:", pairPath);

    response = await clientAcc.runLocal("test1", {});
    console.log("Contract reacted to your test1:", response.decoded.output);

    response = await clientAcc.runLocal("test2", {});
    console.log("Contract reacted to your test2:", response.decoded.output);

    response = await clientAcc.runLocal("test3", {});
    console.log("Contract reacted to your test3:", response.decoded.output);

  }





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
