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
  const contractKeys = signerKeys(await TonClient.default.crypto.generate_random_sign_keys());
  const clientAcc = new Account(Contract, {
    signer: contractKeys,
    client,
  });
  const address = await clientAcc.getAddress();
  console.log(`Future address of the contract will be: ${address}`);
  const wTONroot = JSON.parse(fs.readFileSync('./RootTokenContract.json',{encoding: "utf8"})).address;
  const wTONwrapper = JSON.parse(fs.readFileSync('./TONwrapperContract.json',{encoding: "utf8"})).address;
  console.log('wTONroot ',wTONroot);
  console.log('wTONwrapper ',wTONwrapper);

  const giver = await Account.getGiverForClient(client);
  await giver.sendTo(address, 100_000_000_000);
  console.log(`Grams were transferred from giver to ${address}`);

  let contractJson = JSON.stringify({address:address, keys:contractKeys});
  fs.writeFileSync( pathJson, contractJson,{flag:'w'});
  console.log("Future address of the contract  and keys written successfully to:", pathJson);

  // Request contract deployment funds form a local TON OS SE giver
  // not suitable for other networks.
  // await clientAcc.deploy({ useGiver: true });
  // console.log(`DEXclient contract was deployed at address: ${address}`);

  const deployMessage = await client.abi.encode_message(await clientAcc.getParamsOfDeployMessage({
    initFunctionName:"constructor",
    initInput:{
      wTONroot:wTONroot,
      wTONwrapper:wTONwrapper,
    },
  }));
  let shard_block_id;
  shard_block_id = (await client.processing.send_message({
    message: deployMessage.message,
    send_events: true,
  }, logEvents,
)).shard_block_id;
console.log(`Deploy message was sent.`);



// Monitor message delivery.
// See more info about `wait_for_transaction` here
// https://github.com/tonlabs/TON-SDK/blob/master/docs/mod_processing.md#wait_for_transaction
const deploy_processing_result = await client.processing.wait_for_transaction({
  abi: abiContract(clientAcc.abi),
  message: deployMessage.message,
  shard_block_id: shard_block_id,
  send_events: true,
},
logEvents,
);
// console.log(`Deploy transaction: ${JSON.stringify(deploy_processing_result.transaction, null, 2)}`);
// console.log(`Deploy fees: ${JSON.stringify(deploy_processing_result.fees, null, 2)}`);
console.log(`Contract was deployed at address: ${address}`);

// Call `touch` function
// let response = await clientAcc.run("touch", {});
//
// console.log(`Contract run transaction with output ${response.decoded.output}, ${response.transaction.id}`);

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
