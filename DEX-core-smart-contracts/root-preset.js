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
    const contractJson = fs.readFileSync(pathJson,{encoding: "utf8"});
    const contractData = JSON.parse(contractJson);
    const contractAddress = contractData.address;
    const contractKeys = contractData.keys;
    const clientAcc = new Account(Contract, {
        signer: contractKeys,
        client,
    });

    const wTONroot = JSON.parse(fs.readFileSync('./RootTokenContract.json',{encoding: "utf8"})).address;
    const wUSDTroot = JSON.parse(fs.readFileSync('./wUSDTContract.json',{encoding: "utf8"})).address;
    const wBTCroot = JSON.parse(fs.readFileSync('./wBTCContract.json',{encoding: "utf8"})).address;
    const wETHroot = JSON.parse(fs.readFileSync('./wETHContract.json',{encoding: "utf8"})).address;

    let keys, pubkey, address, keyJson, path, path1, shard;
    path = './DEXsetKeys.json';

    keys = signerKeys(await TonClient.default.crypto.generate_random_sign_keys());
    pubkey = '0x'+keys.keys.public;
    console.log('pubkey: ',pubkey);
    response = await clientAcc.run("computeDEXclientAddr", {pubkey:pubkey});
    console.log("Contract reacted to your computeDEXclientAddr:", response.decoded.output);
    address = response.decoded.output.value0;
    shard = getShard(response.decoded.output.value0);
    keyJson = JSON.stringify({address:address, keys:keys});
    fs.writeFileSync( path, keyJson,{flag:'w'});
    console.log("Future address of the contract  and keys written successfully to:", path);

    // keys = JSON.parse(fs.readFileSync(path,{encoding: "utf8"})).keys;
    // pubkey = '0x'+keys.keys.public;
    // console.log(pubkey);

    let idArr = [];
    for (i=0;i<100;i++){idArr.push(i);}
    console.log(idArr);
    let userIdArr = [];
    let pairAddrArr = [];
    for (const item of idArr) {
      response = await clientAcc.run("computeDEXpairAddrWithId", {pubkey:pubkey,userId:item});
      if (getShard(response.decoded.output.value0) == shard){
        userIdArr.push(item);
        console.log(item,"Contract reacted to your computeDEXpairAddrWithId:", response.decoded.output);
        pairAddrArr.push(response.decoded.output.value0)
      }
    }
    path1 = './DEXsetPairs.json';
    let pairsJson = JSON.stringify({pairsArr:pairAddrArr, createIdArr:userIdArr});
    fs.writeFileSync( path1, pairsJson,{flag:'w'});
    console.log("Future address of the pairs written to:", path1);


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
