const { Account } = require("@tonclient/appkit");
const { libNode } = require("@tonclient/lib-node");
const { Contract } = require("./DEXclientContract.js");
const { DPContract } = require("./DPContract.js");
const { RContract } = require("./RootTokenContract.js");
const hex2ascii = require('hex2ascii');
const networks = ["http://localhost",'net.ton.dev','main.ton.dev'];
const hello = ["Hello localhost TON!","Hello devnet TON!","Hello maitnet TON!"];
const networkSelector = 1;



const {
  abiContract,
  signerKeys,
  TonClient,
} = require("@tonclient/core");
const fs = require('fs');
// const pathJson = './DEXclientContract.json';
const pathJson = './DEXsetKeys.json';



TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  console.log(`params = ${JSON.stringify(params, null, 2)}`);
  console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}




async function main(client) {
  let response;
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });

  // Execute `getAllDataPreparation` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getAllDataPreparation", {});
  // console.log("Contract reacted to your getAllDataPreparation:", response.decoded.output);
  let pairs = response.decoded.output.pairKeysR;
  console.log("All connected pairs:", pairs);
  for (const item of pairs) {
    response = await clientAcc.runLocal("getPair", {value0:item});
    // console.log("Pair[0] info:", response.decoded.output);
    let rootA = response.decoded.output.pairRootA;
    let rootB = response.decoded.output.pairRootB;
    let rootAccA = new Account(RContract, {address: rootA,client,});
    response = await rootAccA.runLocal("getSymbol", {});
    let symbolA = hex2ascii(response.decoded.output.value0)
    console.log('====================');
    console.log("Pair symbolA:", symbolA);
    let rootAccB = new Account(RContract, {address: rootB,client,});
    response = await rootAccB.runLocal("getSymbol", {});
    let symbolB = hex2ascii(response.decoded.output.value0)
    console.log("Pair symbolB:", symbolB);
    let pairAcc = new Account(DPContract, {address: item,client,});
    response = await pairAcc.runLocal("getReservesBalance", {});
    console.log("Pair reserves:", response.decoded.output);
    let rateBA = Number(response.decoded.output.balanceReserveA)/Number(response.decoded.output.balanceReserveB);
    let rateAB = Number(response.decoded.output.balanceReserveB)/Number(response.decoded.output.balanceReserveA);
    console.log('1'+symbolA+' = '+rateAB+' '+symbolB);
    console.log('1'+symbolB+' = '+rateBA+' '+symbolA);
  }


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
