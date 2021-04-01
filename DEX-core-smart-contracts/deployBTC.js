const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { RContract } = require("./RootTokenContract.js");
const { TTWContract } = require("./TONTokenWalletContract.js");
const fs = require('fs');
const hex = require('ascii-hex');
const hex2ascii = require('hex2ascii');
const pathJsonR = './wBTCContract.json';

TonClient.useBinaryLibrary(libNode);

function toHex(input) {
  let output = '';
  for (i = 0; i < input.length; i ++){output += hex(input[i]).toString(16)}
  return String(output);
}

const name = toHex("wrappedBTC");
const symbol = toHex("wBTC");
const decimals = "9";
const root_owner = "0";
const total_supply = "0";

async function logEvents(params, response_type) {
    // console.log(`params = ${JSON.stringify(params, null, 2)}`);
    // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
   const rootAbi = {
     type: 'Contract',
     value: RContract.abi
   }

    const rootKeys = signerKeys(await TonClient.default.crypto.generate_random_sign_keys());
    const rootAcc = new Account(RContract, {
        signer: rootKeys,
        client,
    });
    const rootAddr = await rootAcc.getAddress();
    console.log(`Future address of the rootToken will be: ${rootAddr}`);

    const giver = await Account.getGiverForClient(client);
    await giver.sendTo(rootAddr, 100_000_000_000);
    console.log(`Grams were transferred from giver to ${rootAddr}`);

    let rootJson = JSON.stringify({address:rootAddr, keys:rootKeys});
    fs.writeFileSync( pathJsonR, rootJson,{flag:'w'});
    console.log("Future address of the contract  and keys written successfully to:", pathJsonR);

    let shard_block_id;
    let deployMessage = await client.abi.encode_message(await rootAcc.getParamsOfDeployMessage({
        initFunctionName:"constructor",
        initInput:{
          name:name,
          symbol:symbol,
          decimals:decimals,
          root_public_key:'0x'+rootKeys.keys.public,
          root_owner:root_owner,
          wallet_code: TTWContract.code,
          total_supply:total_supply,
        },
    }));
    shard_block_id = (await client.processing.send_message({
            message: deployMessage.message,
            send_events: true,
        }, logEvents,
    )).shard_block_id;
    console.log(`Deploy rootWrappedUSDT message was sent.`);

    // Monitor message delivery.
    // See more info about `wait_for_transaction` here
    // https://github.com/tonlabs/TON-SDK/blob/master/docs/mod_processing.md#wait_for_transaction
    let deploy_processing_result = await client.processing.wait_for_transaction({
            abi: abiContract(rootAcc.abi),
            message: deployMessage.message,
            shard_block_id: shard_block_id,
            send_events: true,
        },
        logEvents,
    );
    console.log(`Deploy transaction: ${JSON.stringify(deploy_processing_result.transaction, null, 2)}`);
    console.log(`Deploy fees: ${JSON.stringify(deploy_processing_result.fees, null, 2)}`);
    console.log(`Contract was deployed at address: ${rootAddr}`);


    // Call `touch` function
    // let response = await wrapperAcc.run("createZeroWallet", {});
    // console.log(`Contract run createZeroWallet with output ${response.decoded.output}, ${response.transaction.id}`);

    // Execute `getTotalSupply` get method  (execute the message locally on TVM)
    response = await rootAcc.runLocal("getTotalSupply", {});
    console.log("Contract reacted to your getTotalSupply:", response.decoded.output);

    // Execute `getAllDataPreparation` get method  (execute the message locally on TVM)
    // response = await clientAcc.runLocal("getAllDataPreparation", {});
    // console.log("Contract reacted to your getAllDataPreparation:", response.decoded.output);

    // Execute `getAddressWTON` get method  (execute the message locally on TVM)
    // response = await clientAcc.runLocal("getAddressWTON", {});
    // console.log("Contract reacted to your getAddressWTON:", response.decoded.output);


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
