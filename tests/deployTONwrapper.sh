#!/bin/sh

NETWORK=$(./get_network.sh)
CONTRACTS=$(./get_contracts.sh)
TVM_LINKER=$(./get_tvm_linker.sh)
TONOS_CLI=$(./get_tonos_cli.sh)



AMOUNT_TONS=100000000000
GIVER="0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94"
# CODE=$($TVM_LINKER decode --tvc ../$CONTRACTS/RootTokenContract.tvc  | grep code: | cut -c 8-)
# CODE=$($TVM_LINKER decode --tvc ../$CONTRACTS/RootTokenContract.tvc | grep code: | cut -c 8-)
CODE=$(cat ./code.txt) #export TVM_WALLET_CODE=`cat code.txt`
KEYS_FILE="./RootWTON/deploy.keys.json"
PUBKEY=$(cat $KEYS_FILE | grep public | cut -c 14-77)


cp TONwrapper.sol TONwrapperDone.sol


ROOT_ADDR_FILE="./RootWTON/address.json"

ROOT_ADDR=$(cat $ROOT_ADDR_FILE | grep address | cut -c 15-80)

ROOT_ADDR_COMPILE=$(cat $ROOT_ADDR_FILE | grep address | cut -c 17-80)
addressWTON=0x$ROOT_ADDR_COMPILE

cp TONwrapper.sol TONwrapperDone.sol

search="ROOT_WRAPPED_TON = address();"
replace="ROOT_WRAPPED_TON = address("$addressWTON");"
sed -i "s/$search/$replace/" TONwrapperDone.sol

sudo tondev sol compile TONwrapperDone.sol | awk '/Saved contract /'

# CODE=$(./tvm_linker decode --tvc ../contracts/TTW_FT.tvc  | grep code: | cut -c 8-)

ROOT_NAME=$(echo -n "RootWTON" | xxd -p )
ROOT_SYMBOL=$(echo -n "RWTN" | xxd -p )
ROOT_DECIMALS="9"
ROOT_OWNER_PK=$PUBKEY
ROOT_OWNER=0
ROOT_OWNER_ADDRESS=$ZERO_ADDRESS
ROOT_CODE=$CODE
TOTAL_SUPPLY="1000000" 

$TONOS_CLI -u $NETWORK call $GIVER sendGrams "{\"dest\":\"$ROOT_ADDR\",\"amount\":\"$AMOUNT_TONS\"}" --abi ./local_giver.abi.json > /dev/null
ROOT_ADDR1=0:366ac7ca9a78e466b5097203a314e58874655b946e26d52aa24cda3a6feb8e48
$TONOS_CLI -u $NETWORK call $GIVER sendGrams "{\"dest\":\"$ROOT_ADDR1\",\"amount\":\"$AMOUNT_TONS\"}" --abi ./local_giver.abi.json > /dev/null

echo RootWTON: $ROOT_ADDR


# $TONOS_CLI -u $NETWORK account $ROOT_ADDR 

    #   { "name":"name", "type":"bytes" },
    # { "name":"symbol", "type":"bytes" },
    # { "name":"decimals", "type":"uint8" },
    # { "name":"root_public_key", "type":"uint256" },
    # { "name":"root_owner", "type":"uint256" },
    # { "name":"wallet_code", "type":"cell" },
    # { "name":"total_supply", "type":"uint128" }

ROOT_DATA='{"name":"'$ROOT_NAME'","symbol":"'$ROOT_SYMBOL'","decimals":"'$ROOT_DECIMALS'","root_public_key":"0x'$ROOT_OWNER_PK'","root_owner":"'$ROOT_OWNER'","wallet_code":"'$ROOT_CODE'","total_supply":"'$TOTAL_SUPPLY'"}'
# '{"name":"${nameRootTokenHex}","symbol":"${symbolRootTokenHex}", "decimals":"${decimals}","root_public_key":"0x${contractKeysPublic}", "root_owner":"${root_owner}", "wallet_code":"'${TVM_WALLET_CODE.TVM_WALLET_CODE}'","total_supply":"${total_supply}"}'

$TONOS_CLI -u $NETWORK deploy ./TONwrapperDone.tvc {} --abi ./TONwrapperDone.abi.json --sign ./RootWTON/deploy.keys.json --wc 0 #| awk '/Transaction /'
# $TONOS_CLI -u $NETWORK deploy ./TONwrapperDone.tvc $ROOT_DATA --abi ./TONwrapperDone.abi.json --sign ./RootWTON/deploy.keys.json --wc 0 #| awk '/Transaction /'

# ./tonos-cli -u "http://127.0.0.1" call "0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94" sendGrams "{\"dest\":\"0:b91e58c842b3fa41b644b96af57f83b458e4a02242aa0ec47b1f90776559b21b\",\"amount\":\"10000000000\"}" --abi ./local_giver.abi.json

# export TVM_WALLET_CODE=`cat code.txt`

# ./tonos-cli -u "http://127.0.0.1" deploy ../DEX-core-smart-contracts/RootTokenContract.tvc '{"name":"526f6f7441","symbol":"525441", "decimals":"9","root_public_key":"0x6f890c589d1501024e09a905c87f4787174854d793b6d2233a70fbebedf861d3", "root_owner":"0", "wallet_code":"'$TVM_WALLET_CODE'","total_supply":"1000000"}' --abi ../DEX-core-smart-contracts/RootTokenContract.abi --sign ./RootA/deploy.keys.json --wc 0

# ./tonos-cli -u "http://127.0.0.1" genaddr ../DEX-core-smart-contracts/RootTokenContract.tvc ../DEX-core-smart-contracts/RootTokenContract.abi --setkey ./RootA/deploy.keys.json --wc 0



$TONOS_CLI -u $NETWORK account $ROOT_ADDR #| awk '/acc_type: /'
# ./tonos-cli run ${rawAddress} getName {} --abi RootTokenContract.abi
# ./tonos-cli run ${rawAddress} getSymbol {} --abi RootTokenContract.abi
# ./tonos-cli run ${rawAddress} getDecimals {} --abi RootTokenContract.abi 
# ./tonos-cli run ${rawAddress} getRootKey {} --abi RootTokenContract.abi
# ./tonos-cli run ${rawAddress} getTotalSupply {} --abi RootTokenContract.abi
# ./tonos-cli run ${rawAddress} getWalletCode {} --abi RootTokenContract.abi
# ./tonos-cli run ${rawAddress} getTotalGranted {} --abi RootTokenContract.abi
# ./tonos-cli account ${rawAddress}