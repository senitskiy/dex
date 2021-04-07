tondev tonos-cli install


tondev sol set --compiler 0.38.0 --linker 0.23.54

sudo tondev sol update --force

Install
npm i -g tondev@0.4.0
Update
npm r -g tondev  
npm i -g tondev0.4.0




TONDev Version: 0.4.0
TVM-linker: 0.2.1

get_contracts.sh
get_network.sh
get_tonos_cli.sh
get_tvm_linker.sh


////////////////////////////////////////
sudo tondev se start

./deployALL.sh


////////////////////////////////////////
sudo tondev se reset

cp TONwrapper.sol TONwrapperDone.sol

addressWTON=0:b91e58c842b3fa41b644b96af57f83b458e4a02242aa0ec47b1f90776559b21b
search="ROOT_WRAPPED_TON = address();"
replace="ROOT_WRAPPED_TON = address("$addressWTON");"
sed -i "s/$search/$replace/" TONwrapperDone.sol

./tonos-cli genphrase
```
0:366ac7ca9a78e466b5097203a314e58874655b946e26d52aa24cda3a6feb8e48
```

./tonos-cli getkeypair <deploy.keys.json> "<seed_phrase>"
```

```
./tonos-cli genaddr DEXclient.tvc DEXclient.abi --setkey deploy.keys.json --wc 0
```

```
./tonos-cli account 
```

```
./tonos-cli deploy DEXclient.tvc '{}' --abi DEXclient.abi --sign deploy.keys.json --wc 0
```




```
./tonos-cli run <DEXclient_address> showContractAddress {} --abi DEXclient.abi
./tonos-cli run <DEXclient_address> getAddressWTON {} --abi DEXclient.abi
```

`getAddressWTON` give you <DEXclient_wTon_address> of your DEXclient for wrapp your TON to wTON:
```
./tonos-cli run <DEXclient_wTon_address> getBalance {} --abi TONTokenWallet.abi

```

## 6. Preparing for operation with TIP-3 tokens
### 6.1. Check your TON balance of DEXclient
```
./tonos-cli account <DEXclient_address>
```
We require have on balance more then 100 TON for testing.

### 6.2. Send your TON
```
./tonos-cli call <DEXclient_address> sendTransfer '{"dest":"<set_destination>","value":"<set_quantity_TON_grams_which_you_want_to_send>","bounce":"<set_bounce_true_or_false>"}' --sign deploy.keys.json --abi DEXclient.abi
```



### 6.3. Wrap your TON to wTON and unwrap back your wTON to TON
```
./tonos-cli call <DEXclient_address> wrapTON '{"qtyTONgrams":"<set_quantity_TON_grams>"}' --sign deploy.keys.json --abi DEXclient.abi

```

```
./tonos-cli run <DEXclient_wTon_address> getBalance {} --abi TONTokenWallet.abi

```
You can unwrap back all your wTON to TON using comand:
```
./tonos-cli call <DEXclient_address> unwrapTON '{}' --sign deploy.keys.json --abi DEXclient.abi

```
### 6.4. DEX preset configuration (deployed on net.ton.dev)


- wTON 0:bc865dc0b225ec75e158a2e3f862ce6a2398f733930de3fc626643dfdacfb798
- wUSDT 0:b7b17288b1e1c1166797fc40f6329aa598ef720176738769f79fa49c87f50feb
- wBTC 0:2ffafd25bdc5b322318ca768d8fa9044cf602c4589b02671a430b1ff949173ac
- wETH 0:2e3854dcfa1f1150e3ad3062692e9891650a8915c9982879829b3b47080189aa


DEXpair.sol with wTON
- wTON-wUSDT 0:f06c877542037ca512e43e42ca621c998daccce28fe02b5246a89551cb8659d5
- wTON-wBTC 0:03bb86589570aa7e0b95ceabba2f5eecc0c731a4b74fb1c0cec2bddc23add81b
- wTON-wETH 0:aa7d2070534679facaab708b985f27b791adf2fcc2d35465c4926b61fea3dd97

DEXpair.sol without wTON
- wBTC-wUSDT 0:0a1f28614409c815d3e5f0774ed161c71929ae800b8f4bef6954b65147beb669
- wETH-wUSDT 0:8588a819c849e7209a4d730dc1d8516ef29f4f17bcd5b459ba2ebae93f36c9a6


```
./tonos-cli run <DEXpair_address> getReservesBalance '{}' --abi DEXpair.abi.json

```
- "balanceReserveA": "<nanoTokens_quantity>"
- "balanceReserveB": "<nanoTokens_quantity>"




```
./tonos-cli run <DEXclient_address> getPair '{"value0":"<DEXpair_address>"}' --abi DEXclient.abi

```
You will get:
- "pairRootA": "<TIP3_RootTokenContract_address_for_TokenA>",
- "pairReserveA": "<TIP3_Wallet_DEXpair_reserve_storage_address_for_TokenA>",
- "clientDepositA": "<DEXclient_deposit_wallet_where_DEXpair_internal_owner_for_TokenA>",
- "clientAllowanceA": "0",
- "pairRootB": "<TIP3_RootTokenContract_address_for_TokenB>",
- "pairReserveB": "<TIP3_Wallet_DEXpair_reserve_storage_address_for_TokenB>",
- "clientDepositB": "<DEXclient_deposit_wallet_where_DEXpair_internal_owner_for_TokenB>",
- "clientAllowanceB": "0",
- "curPair": "<DEXpair_address>"

You can check your deposit wallets balances for DEXpair tokens using:
```
./tonos-cli run <DEXclient_deposit_wallet_where_DEXpair_internal_owner_for_TokenA> getBalance {} --abi TONTokenWallet.abi
./tonos-cli run <DEXclient_deposit_wallet_where_DEXpair_internal_owner_for_TokenB> getBalance {} --abi TONTokenWallet.abi

```

### 7.2. Get DEXclient wallets for DEXpair tokens roots where internal_owner is DEXclient
```
./tonos-cli run <DEXclient_address> getPairClientWallets '{"pairAddr":"<DEXpair_address>"}' --abi DEXclient.abi
```
You will get:
- "walletA": "<DEXclient_wallet_where_DEXclient_internal_owner_for_TokenA>",
- "walletB": "<DEXclient_wallet_where_DEXclient_internal_owner_for_TokenA>",

You can check your wallets balances for DEXpair tokens using:
```
./tonos-cli run <DEXclient_wallet_where_DEXclient_internal_owner_for_TokenA> getBalance {} --abi TONTokenWallet.abi
./tonos-cli run <DEXclient_wallet_where_DEXclient_internal_owner_for_TokenA> getBalance {} --abi TONTokenWallet.abi

```


### 7.3. Make deposit A or B to DEXpair and return
```
./tonos-cli call <DEXclient_address> makeAdepositToPair '{"pairAddr":"<DEXpair_address>","qtyA":"<set_quantity_nanoTokens>"}' --sign deploy.keys.json --abi DEXclient.abi
./tonos-cli call <DEXclient_address> makeBdepositToPair '{"pairAddr":"<DEXpair_address>","qtyB":"<set_quantity_nanoTokens>"}' --sign deploy.keys.json --abi DEXclient.abi
./tonos-cli call <DEXclient_address> returnDepositFromPair '{"pairAddr":"<DEXpair_address>"}' --sign deploy.keys.json --abi DEXclient.abi
```
You can check change of your wallets balances using commands from 7.1 and 7.2

### 7.4. Swaps 'A to B' and 'B to A'
```
./tonos-cli call <DEXclient_address> processSwapA '{"pairAddr":"<DEXpair_address>","qtyA":"<set_quantity_nanoTokens>"}' --sign deploy.keys.json --abi DEXclient.abi
./tonos-cli call <DEXclient_address> processSwapB '{"pairAddr":"<DEXpair_address>","qtyB":"<set_quantity_nanoTokens>"}' --sign deploy.keys.json --abi DEXclient.abi
```
- You can check change of your wallets balances using commands from 7.1 and 7.2
- You can check change of DEXpair reserves balances using commands from 6.4

### 7.5. Provide liquidity to DEXpairs and return

If you want to became shareholder of DEXpair and will get part of DEXpair profit you need provide some liquidity to DEXpair.
You should collect both DEXpair tokens on your wallets using swap.
Any time you can returm your part of DEXpair reserves balances.

```
./tonos-cli call <DEXclient_address> makeABdepositToPair '{"pairAddr":"<DEXpair_address>","qtyA":"<set_quantity_nanoTokens>","qtyB":"<set_quantity_nanoTokens>"}' --sign deploy.keys.json --abi DEXclient.abi
./tonos-cli call <DEXclient_address> processLiquidity '{"pairAddr":"<DEXpair_address>","qtyB":"<set_quantity_nanoTokens>","qtyB":"<set_quantity_nanoTokens>"}' --sign deploy.keys.json --abi DEXclient.abi
./tonos-cli call <DEXclient_address> returnAllLiquidity '{"pairAddr":"<DEXpair_address>"}' --sign deploy.keys.json --abi DEXclient.abi

```
You can check change of your wallets balances using commands from 7.1 and 7.2
You can check change of DEXpair reserves balances using commands from 6.4
You can check your part of DEXpair using command:

```
./tonos-cli run <DEXpair_address> getShareReserveProvider '{"providerAddr":"<DEXclient_address>"}' --abi DEXpair.abi.json
./tonos-cli run <DEXpair_address> getTotalSupply '{}' --abi DEXpair.abi.json

```
You will get
- totalSupplyDEXpair: '<total_number_of_stakes>'
- balanceDEXprovider: '<your_number_of_stakes>'

## 8. DEXclient management using TON SDK (ton-client-js) with examples 
### 8.1. Install dependencies
```
npm i --save @tonclient/core
npm i --save @tonclient/lib-node
npm i --save fs

```
### 8.2. Deploy DEXclient contract to the blockchain
```
node deployDEXclient.js
```
* `const pathJson = './DEXclientContract.json';` - at the end of script <DEXclient_address> and keys will be in this file.
* `const tongrams = 100000000000;` - tongrams qty which giver transfer to <DEXclient_address> before deploy.

### 8.3. Connect to DEXpairs
```
node connectTONxUSDT.js
node connectTONxBTC.js
node connectTONxETH.js
node connectBTCxUSDT.js
node connectETHxUSDT.js
```
You can check DEXclient connection to DEXpair using commands:
```
node showTONUSDT.js
node showTONBTC.js
node showTONETH.js
node showBTCUSDT.js
node showETHUSDT.js
```
You can check DEXpair using commands:
```
node pairTONUSDT.js
node pairTONBTC.js
node pairTONETH.js
node pairBTCUSDT.js
node pairETHUSDT.js
```
### 8.4. Wrap TON to wTON and unwrap
You can wrap some of your TON using script:
```
node wrap.js
```
* `const qtyTONgrams = 50000000000;` - set here qty TON grams for wrap

- You can check change of  wallets balances using commands from 8.3

You can unwrap all your wTON using script:
```
node unwrap.js
```

### 8.5. Deposit tokenA or tokenB

```
node depositA.js
node depositB.js

```
* `const pathJsonPair = './DEXpairContractTONxUSDT.json';` - select working DEXpair
* `const qtyTokens = 3000000000;` - set here qty nanoTokens for deposit

- You can check change of  wallets balances using commands from 8.3

You can return all your deposits from DEXpair using script:
```
node returnDeposit.js
```
* `const pathJsonPair = './DEXpairContractTONxUSDT.json';` - select working DEXpair

### 8.5. Swap tokenA or tokenB

```
node swapA.js
node swapB.js

```
* `const pathJsonPair = './DEXpairContractTONxUSDT.json';` - select working DEXpair
* `const qtyToken = 1000000000;` - set here qty nanoTokens for swap

- You can check change of  wallets balances using scrip from 8.3

### 8.6. Provide liquidity to DEXpairs and return

If you want to became shareholder of DEXpair and will get part of DEXpair profit you need provide some liquidity to DEXpair.
You should collect both DEXpair tokens on your wallets using swap.
Any time you can returm your part of DEXpair reserves balances.

- First add deposit:
```
node depositAB.js

```
* `const pathJsonPair = './DEXpairContractTONxUSDT.json';` - select working DEXpair
* `const qtyTokenA = <quantity in nanoTokens>;` - set here qtyA nanoTokens for deposit
* `const qtyTokenB = <quantity in nanoTokens>;` - set here qtyB nanoTokens for deposit

- Second provide Liquidity:
```
node provide.js

```
* `const pathJsonPair = './DEXpairContractTONxUSDT.json';` - select working DEXpair
* `const qtyTokenA = <quantity in nanoTokens>;` - set here qtyA nanoTokens for provide
* `const qtyTokenB = <quantity in nanoTokens>;` - set here qtyB nanoTokens for provide

- You can check result using script for specified pair:
```
node pairTONUSDT.js
node pairTONBTC.js
node pairTONETH.js
node pairBTCUSDT.js
node pairETHUSDT.js

```
- You can return all your provided liquidity using script:
```
node returnLiquidity.js

```
* `const pathJsonPair = './DEXpairContractTONxUSDT.json';` - select working DEXpair
Make deposit A or B to DEXpair and return
```
./tonos-cli cal