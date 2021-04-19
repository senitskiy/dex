const {TonClient, abiContract, signerKeys} = require("@tonclient/core");
const { libNode } = require("@tonclient/lib-node");
const { Account } = require("@tonclient/appkit");
const { Contract } = require("./DEXclientContract.js");
const { TTWContract } = require("./TONTokenWalletContract.js");
const fs = require('fs');
// const pathJson = './DEXclientContract.json';
const pathJson = './DEXsetKeys.json';
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
  const contractKeys = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).keys;
  const contractAddr = JSON.parse(fs.readFileSync(pathJson,{encoding: "utf8"})).address;
  const clientAcc = new Account(Contract, {
    address: contractAddr,
    signer: contractKeys,
    client,
  });

  const pairTONxUSDT = JSON.parse(fs.readFileSync('./DEXpairTONxUSDT.json',{encoding: "utf8"})).address;
  response = await clientAcc.runLocal("getPairClientWallets", {pairAddr:pairTONxUSDT});
  let walletTON = new Account(TTWContract, {address: response.decoded.output.walletA,client,});
  let walletUSDT = new Account(TTWContract, {address: response.decoded.output.walletB,client,});
  response = await walletTON.runLocal("getBalance", {});
  let balanceTON = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance  TON:", balanceTON);
  response = await walletUSDT.runLocal("getBalance", {});
  let balanceUSDT = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance USDT:", balanceUSDT);
  const pairTONxBTC = JSON.parse(fs.readFileSync('./DEXpairTONxBTC.json',{encoding: "utf8"})).address;
  response = await clientAcc.runLocal("getPairClientWallets", {pairAddr:pairTONxBTC});
  let walletBTC = new Account(TTWContract, {address: response.decoded.output.walletB,client,});
  response = await walletBTC.runLocal("getBalance", {});
  let balanceBTC = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance BTC:", balanceBTC);
  const pairTONxETH = JSON.parse(fs.readFileSync('./DEXpairTONxETH.json',{encoding: "utf8"})).address;
  response = await clientAcc.runLocal("getPairClientWallets", {pairAddr:pairTONxETH});
  console.log('Contract run getPairClientWallets with output', response.decoded.output);
  let walletETH = new Account(TTWContract, {address: response.decoded.output.walletB,client,});
  response = await walletETH.runLocal("getBalance", {});
  let balanceETH = response.decoded.output.value0;
  console.log("Contract reacted to your getBalance ETH:", balanceETH);
  response = await clientAcc.runLocal("getBalanceTONgrams", {});
  console.log("Contract reacted to your getBalanceTONgrams:", response.decoded.output.balanceTONgrams);
  let provideTON = [Math.round(balanceTON / 3)];
  provideTON.push(provideTON[0]);
  provideTON.push(balanceTON - provideTON[0] - provideTON[1]);
  console.log(provideTON);
  let provideUSDT = [Math.round(balanceUSDT / 3)];
  provideUSDT.push(provideUSDT[0]);
  provideUSDT.push(balanceUSDT - provideUSDT[0] - provideUSDT[1]);
  console.log(provideUSDT);
  let provideBTC = [Math.round(balanceBTC / 2)];
  provideBTC.push(balanceBTC - provideBTC[0]);
  console.log(provideBTC);
  let provideETH = [Math.round(balanceETH / 2)];
  provideETH.push(balanceETH - provideETH[0]);
  console.log(provideETH);

  const pairBTCxUSDT = JSON.parse(fs.readFileSync('./DEXpairBTCxUSDT.json',{encoding: "utf8"})).address;
  const pairETHxUSDT = JSON.parse(fs.readFileSync('./DEXpairETHxUSDT.json',{encoding: "utf8"})).address;
  // Call `makeABdepositToPair` function
  response = await clientAcc.run("makeABdepositToPair", {pairAddr:pairTONxUSDT,qtyA:provideTON[0],qtyB:provideUSDT[0]});
  console.log('Contract run makeABdepositToPair with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("makeABdepositToPair", {pairAddr:pairTONxBTC,qtyA:provideTON[1],qtyB:provideBTC[0]});
  console.log('Contract run makeABdepositToPair with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("makeABdepositToPair", {pairAddr:pairTONxETH,qtyA:provideTON[2],qtyB:provideETH[0]});
  console.log('Contract run makeABdepositToPair with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("makeABdepositToPair", {pairAddr:pairBTCxUSDT,qtyA:provideBTC[1],qtyB:provideUSDT[1]});
  console.log('Contract run makeABdepositToPair with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("makeABdepositToPair", {pairAddr:pairETHxUSDT,qtyA:provideETH[1],qtyB:provideUSDT[2]});
  console.log('Contract run makeABdepositToPair with output', response.decoded.output, response.transaction.id);

  // Call `processLiquidity` function
  response = await clientAcc.run("processLiquidity", {pairAddr:pairTONxUSDT,qtyA:provideTON[0],qtyB:provideUSDT[0]});
  console.log('Contract run processLiquidity with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("processLiquidity", {pairAddr:pairTONxBTC,qtyA:provideTON[1],qtyB:provideBTC[0]});
  console.log('Contract run processLiquidity with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("processLiquidity", {pairAddr:pairTONxETH,qtyA:provideTON[2],qtyB:provideETH[0]});
  console.log('Contract run processLiquidity with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("processLiquidity", {pairAddr:pairBTCxUSDT,qtyA:provideBTC[1],qtyB:provideUSDT[1]});
  console.log('Contract run processLiquidity with output', response.decoded.output, response.transaction.id);
  response = await clientAcc.run("processLiquidity", {pairAddr:pairETHxUSDT,qtyA:provideETH[1],qtyB:provideUSDT[2]});
  console.log('Contract run processLiquidity with output', response.decoded.output, response.transaction.id);




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
