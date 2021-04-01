# Working with DEX core smart-contracts

## 8. DEXclient management using TON SDK (ton-client-js) with examples
### 8.1. Install dependencies
```
npm i --save @tonclient/core
npm i --save @tonclient/lib-node
npm i --save fs

```
### 8.2. Deploy roots wUSDT, wBTC, wETH, wTON and TONwrapper contracts to the blockchain
```
node deployTONW.js
node deployUSDT.js
node deployBTC.js
node deployETH.js

```

### 8.3. Deploy DEXpairs
```
node deployDP1.js
node deployDP2.js
node deployDP3.js
node deployDP4.js
node deployDP5.js
```
You can check DEXpairs:
```
node getDP1.js
node getDP2.js
node getDP3.js
node getDP4.js
node getDP5.js
```
### 8.4. Deploy DEXclient connect it to all pairs, wrap TON and charge by wUSDT, wBTC, wETH
```
node deployDC.js

```


```
node connectDC.js
node wrapDC.js <-> node unwrapDC.js
node chargeDC.

node balanceDC.js

```

### 8.5. ProvideLiquidity to all pairs

```
node provideDC.js <-> node selectDC.js
node rateDC.js
node investDC.js

```

### 8.6. Swap 

```
node swapA1.js
node swapB2.js

```
