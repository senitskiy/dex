const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXclientContract.js");
const { RContract } = require("./RootTokenContract.js");
const fs = require('fs');
// const pathJson = './DEXclientContract.json';
const pathJson = './DEXsetKeys.json';
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

function convert(number, decimal) {
  return Math.trunc(number)*(10**decimal) + Math.floor((number - Math.trunc(number))*(10**decimal));
}

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  let btcusdData = await CoinGeckoClient.coins.fetch('bitcoin', {});
  console.log('1 bitcoin = ', btcusdData.data.market_data.current_price.usd,' usd');
  let btcusd = Number(btcusdData.data.market_data.current_price.usd);
  let ethusdData = await CoinGeckoClient.coins.fetch('ethereum', {});
  console.log('1 ethereum = ',ethusdData.data.market_data.current_price.usd,' usd');
  let ethusd = Number(ethusdData.data.market_data.current_price.usd);
  let tonusdData = await CoinGeckoClient.coins.fetch('ton-crystal', {});
  console.log('1 ton = ',tonusdData.data.market_data.current_price.usd,' usd');
  let tonusd = Number(tonusdData.data.market_data.current_price.usd);
  let tonprovide = 30000000;
  let usdprovide = tonprovide * tonusd;
  let ethprovide = 2 * ((usdprovide / 3) / ethusd);
  let btcprovide = 2 * ((usdprovide / 3) / btcusd);
  tonprovide = convert(tonprovide,9);
  usdprovide = convert(usdprovide,9);
  ethprovide = convert(ethprovide,9);
  btcprovide = convert(btcprovide,9);
  console.log(tonprovide,' nano wTON');
  console.log(usdprovide,' nano wUSD');
  console.log(ethprovide,' nano wETH');
  console.log(btcprovide,' nano wBTC');

  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });

  const rootUSDT = JSON.parse(fs.readFileSync('./wUSDTContract.json',{encoding: "utf8"})).address;
  const keysUSDT = JSON.parse(fs.readFileSync('./wUSDTContract.json',{encoding: "utf8"})).keys;
  const rootBTC = JSON.parse(fs.readFileSync('./wBTCContract.json',{encoding: "utf8"})).address;
  const keysBTC = JSON.parse(fs.readFileSync('./wBTCContract.json',{encoding: "utf8"})).keys;
  const rootETH = JSON.parse(fs.readFileSync('./wETHContract.json',{encoding: "utf8"})).address;
  const keysETH = JSON.parse(fs.readFileSync('./wETHContract.json',{encoding: "utf8"})).keys;

  const usdtAcc = new Account(RContract, {
    signer: keysUSDT,
    client,
  });

  const btcAcc = new Account(RContract, {
    signer: keysBTC,
    client,
  });

  const ethAcc = new Account(RContract, {
    signer: keysETH,
    client,
  });

  let response;

  // Call `mint` function
  response = await usdtAcc.run("mint", {tokens:usdprovide});
  console.log('Contract run mint with output', response.decoded.output, response.transaction.id);

  // Call `mint` function
  response = await btcAcc.run("mint", {tokens:btcprovide});
  console.log('Contract run mint with output', response.decoded.output, response.transaction.id);

  // Call `mint` function
  response = await ethAcc.run("mint", {tokens:ethprovide});
  console.log('Contract run mint with output', response.decoded.output, response.transaction.id);

  // Execute `getWalletByRoot` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getWalletByRoot", {rootAddr:rootUSDT});
  let walletUSDT = response.decoded.output.wallet;
  console.log("Contract reacted to your getWalletByRoot:", walletUSDT);

  // Execute `getWalletByRoot` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getWalletByRoot", {rootAddr:rootBTC});
  let walletBTC = response.decoded.output.wallet;
  console.log("Contract reacted to your getWalletByRoot:", walletBTC);

  // Execute `getWalletByRoot` get method  (execute the message locally on TVM)
  response = await clientAcc.runLocal("getWalletByRoot", {rootAddr:rootETH});
  let walletETH = response.decoded.output.wallet;
  console.log("Contract reacted to your getWalletByRoot:", walletETH);

  // Call `grant` function
  response = await usdtAcc.run("grant", {dest:walletUSDT,tokens:usdprovide,grams:200000000});
  console.log('Contract run grant with output', response.decoded.output, response.transaction.id);

  // Call `grant` function
  response = await btcAcc.run("grant", {dest:walletBTC,tokens:btcprovide,grams:200000000});
  console.log('Contract run grant with output', response.decoded.output, response.transaction.id);

  // Call `grant` function
  response = await ethAcc.run("grant", {dest:walletETH,tokens:ethprovide,grams:200000000});
  console.log('Contract run grant with output', response.decoded.output, response.transaction.id);

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
