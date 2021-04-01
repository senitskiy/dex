const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { Account } = require("@tonclient/appkit");
const { libNode } = require("@tonclient/lib-node");
const { Contract } = require("./DEXclientContract.js");
const { DPContract } = require("./DPContract.js");
const { RContract } = require("./RootTokenContract.js");
const hex2ascii = require('hex2ascii');
const fs = require('fs');
const pathJson = './DEXclientContract.json';
const qtySwapA = 10000000000000;
const pairTONxUSDT = JSON.parse(fs.readFileSync('./DEXpairTONxUSDT.json',{encoding: "utf8"})).address;

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  console.log(`params = ${JSON.stringify(params, null, 2)}`);
  console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  let response;
  const contractJson = fs.readFileSync(pathJson,{encoding: "utf8"});
  const contractData = JSON.parse(contractJson);
  const contractAddress = contractData.address;
  const contractKeys = contractData.keys;
  const clientAcc = new Account(Contract, {
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

  response = await clientAcc.run("makeAdepositToPair", {pairAddr:pairTONxUSDT,qtyA:qtySwapA});
  console.log('Contract run makeAdepositToPair with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("processSwapA", {pairAddr:pairTONxUSDT,qtyA:qtySwapA});
  console.log('Contract run processSwapA with output', response.decoded.output, response.transaction.id);

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
