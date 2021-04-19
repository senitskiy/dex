const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXrootContract.js");
const { GiverContract } = require("./GiverContract.js");
const fs = require('fs');
const pathJson = './DEXrootContract.json';
const networks = ["http://localhost",'net.ton.dev','main.ton.dev'];
const hello = ["Hello localhost TON!","Hello devnet TON!","Hello maitnet TON!"];
const networkSelector = 1;


TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  let response;
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


  if (networkSelector == 0) {
    const giver = await Account.getGiverForClient(client);
    await giver.sendTo(address, 100_000_000_000);
    console.log(`Grams were transferred from giver to ${address}`);
  } else if (networkSelector == 1) {
    const giverNTDAddress = JSON.parse(fs.readFileSync('./GiverContractNTD.json',{encoding: "utf8"})).address;;
    const giverNTDKeys = JSON.parse(fs.readFileSync('./GiverContractNTD.json',{encoding: "utf8"})).keys;
    const giverNTDAcc = new Account(GiverContract, {
      address: giverNTDAddress,
      signer: giverNTDKeys,
      client,
    });
    // Call `sendTransaction` function
    response = await giverNTDAcc.run("sendTransaction", {dest:address,value:20000000000,bounce:false});
    console.log("Giver send 20 ton to address:", address, response.decoded.output);
  } else if (networkSelector == 2){console.log('Pls set giver for main.ton.dev');} else {console.log('networkSelector is incorrect');}

  const keyJson = JSON.stringify({address:address, keys:contractKeys});
  fs.writeFileSync( pathJson, keyJson,{flag:'w'});
  console.log("Future address of the contract  and keys written successfully to:", pathJson);


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

// console.log('Contract.codeDC: ',Contract.codeDC);
// console.log('Contract.codeDP: ',Contract.codeDP);


// Call `setDEXclientCode` function
response = await clientAcc.run("setDEXclientCode", {code:Contract.codeDC});
console.log("Contract reacted to your setDEXclientCode:", response.decoded.output);

// Call `setDEXpairCode` function
response = await clientAcc.run("setDEXpairCode", {code:Contract.codeDP});
console.log("Contract reacted to your setDEXpairCode:", response.decoded.output);


// Execute `codeDEXclient` get method  (execute the message locally on TVM)
// response = await clientAcc.runLocal("codeDEXclient", {});
// console.log("Contract reacted to your codeDEXclient:", response.decoded.output);

// Execute `codeDEXpair` get method  (execute the message locally on TVM)
// response = await clientAcc.runLocal("codeDEXpair", {});
// console.log("Contract reacted to your codeDEXpair:", response.decoded.output);



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
