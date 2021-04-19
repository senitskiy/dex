const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXclientContract.js");
const { RContract } = require("./RootTokenContract.js");
const { GiverContract } = require("./GiverContract.js");
const fs = require('fs');
// const pathJson = './DEXclientContract.json';
const pathJson = './DEXsetKeys.json';
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const networks = ["http://localhost",'net.ton.dev','main.ton.dev'];
const hello = ["Hello localhost TON!","Hello devnet TON!","Hello maitnet TON!"];
const networkSelector = 1;


function convert(number, decimal) {
  return Math.trunc(number)*(10**decimal) + Math.floor((number - Math.trunc(number))*(10**decimal));
}

TonClient.useBinaryLibrary(libNode);

async function logEvents(params, response_type) {
  // console.log(`params = ${JSON.stringify(params, null, 2)}`);
  // console.log(`response_type = ${JSON.stringify(response_type, null, 2)}`);
}

async function main(client) {
  let response;
  let btcusdData = await CoinGeckoClient.coins.fetch('bitcoin', {});
  console.log('1 bitcoin = ', btcusdData.data.market_data.current_price.usd,' usd');
  let btcusd = Number(btcusdData.data.market_data.current_price.usd);
  let ethusdData = await CoinGeckoClient.coins.fetch('ethereum', {});
  console.log('1 ethereum = ',ethusdData.data.market_data.current_price.usd,' usd');
  let ethusd = Number(ethusdData.data.market_data.current_price.usd);
  let tonusdData = await CoinGeckoClient.coins.fetch('ton-crystal', {});
  console.log('1 ton = ',tonusdData.data.market_data.current_price.usd,' usd');
  let tonusd = Number(tonusdData.data.market_data.current_price.usd);
  let tonprovide = 3000;
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

  if (networkSelector == 0) {
    const giver = await Account.getGiverForClient(client);
    await giver.sendTo(dexclientAddr, 3000_000_000_000);
    console.log(`3000 TON were transferred from giver to ${contractAddr}`);
  } else if (networkSelector == 1) {
    const giverNTDAddress = JSON.parse(fs.readFileSync('./GiverContractNTD.json',{encoding: "utf8"})).address;;
    const giverNTDKeys = JSON.parse(fs.readFileSync('./GiverContractNTD.json',{encoding: "utf8"})).keys;
    const giverNTDAcc = new Account(GiverContract, {
      address: giverNTDAddress,
      signer: giverNTDKeys,
      client,
    });
    // Call `sendTransaction` function
    response = await giverNTDAcc.run("sendTransaction", {dest:contractAddr,value:3000000000000,bounce:false});
    console.log("Giver send 3000 TON to address:", contractAddr, response.decoded.output);
  } else if (networkSelector == 2){console.log('Pls set giver for main.ton.dev');} else {console.log('networkSelector is incorrect');}

  let fee = 1399000;
  tonprovide += fee;
  // Call `wrapTON` function
  response = await clientAcc.run("wrapTON", {qtyTONgrams:tonprovide});
  console.log('Contract run wrapTON with output', response.decoded.output, response.transaction.id);


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
