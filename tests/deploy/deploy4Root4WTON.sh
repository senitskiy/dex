#!/bin/sh

NETWORK=$(./configes/get_network.sh)
CONTRACTS=$(./configes/get_contracts.sh)
TVM_LINKER=$(./configes/get_tvm_linker.sh)
TONOS_CLI=$(./configes/get_tonos_cli.sh)

# echo $NETWORK
# echo $CONTRACTS
# echo $TVM_LINKER
# echo $TONOS_CLI

AMOUNT_TONS=6000000000
GIVER="0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94"
# CODE=$($TVM_LINKER decode --tvc ../$CONTRACTS/RootTokenContract.tvc  | grep code: | cut -c 8-)
# CODE=$($TVM_LINKER decode --tvc ../$CONTRACTS/RootTokenContract.tvc | grep code: | cut -c 8-)
CODE=$(cat ./code.txt) #export TVM_WALLET_CODE=`cat code.txt`
KEYS_FILE="./RootWTON/deploy.keys.json"
PUBKEY=$(cat $KEYS_FILE | grep public | cut -c 14-77)
# echo 1

# CODE=$(./tvm_linker decode --tvc ../contracts/TTW_FT.tvc  | grep code: | cut -c 8-)

ROOT_NAME=$(echo -n "RootWTON" | xxd -p )
ROOT_SYMBOL=$(echo -n "RWTON" | xxd -p )
ROOT_DECIMALS="9"
# ROOT_OWNER_PK=$PUBKEY
ROOT_OWNER_PK="0"
# ROOT_OWNER="0x30553a73ac060f47c7a06fd9b50ab915603bb4a811efcd0e84fceb991a3eb97a"
ROOT_OWNER_ADDRESS=$ZERO_ADDRESS
ROOT_CODE=$CODE
TOTAL_SUPPLY="1000000" 

# echo 11
ROOT_OWNER_FILE="./WTON/address.json"
# echo 11

# ROOT_ADDR=$(cat $ROOT_ADDR_FILE | grep address | cut -c 15-80)
ROOT_OWNER_COMPILE=$(cat $ROOT_OWNER_FILE | grep address | cut -c 17-80)
# echo 11
ROOT_OWNER=0x$ROOT_OWNER_COMPILE
echo ROOT_OWNER: $ROOT_OWNER

# ROOT_DATA='{"_name":"'$ROOT_NAME'","_symbol":"'$ROOT_SYMBOL'","_decimals":'$ROOT_DECIMALS',"_rootPublicKey":"0x'$ROOT_OWNER_PK'","_rootOwnerAddress":"'$ZERO_ADDRESS'","_code":"'$CODE'"}'

ROOT_ADDR_FILE="./RootWTON/address.json"
ROOT_ADDR=$(cat $ROOT_ADDR_FILE | grep address | cut -c 15-80)
# echo ROOT_ADDR: $ROOT_ADDR

# $TONOS_CLI -u $NETWORK account $ROOT_ADDR
echo ========================================================================
echo Deploy Root for WTON
$TONOS_CLI -u $NETWORK call $GIVER sendGrams "{\"dest\":\"$ROOT_ADDR\",\"amount\":\"$AMOUNT_TONS\"}" --abi ./local_giver.abi.json > /dev/null
echo RootWTON: $ROOT_ADDR


# ADDR=0:30553a73ac060f47c7a06fd9b50ab915603bb4a811efcd0e84fceb991a3eb97a
# $TONOS_CLI -u $NETWORK call $GIVER sendGrams "{\"dest\":\"$ADDR\",\"amount\":\"$AMOUNT_TONS\"}" --abi ./local_giver.abi.json > /dev/null
# $TONOS_CLI -u $NETWORK account $ROOT_ADDR 

    #   { "name":"name", "type":"bytes" },
    # { "name":"symbol", "type":"bytes" },
    # { "name":"decimals", "type":"uint8" },
    # { "name":"root_public_key", "type":"uint256" },
    # { "name":"root_owner", "type":"uint256" },
    # { "name":"wallet_code", "type":"cell" },
    # { "name":"total_supply", "type":"uint128" }

ROOT_DATA='{"name":"'$ROOT_NAME'","symbol":"'$ROOT_SYMBOL'","decimals":"'$ROOT_DECIMALS'","root_public_key":"'$ROOT_OWNER_PK'","root_owner":"'$ROOT_OWNER'","wallet_code":"'$ROOT_CODE'","total_supply":"'$TOTAL_SUPPLY'"}'
# '{"name":"${nameRootTokenHex}","symbol":"${symbolRootTokenHex}", "decimals":"${decimals}","root_public_key":"0x${contractKeysPublic}", "root_owner":"${root_owner}", "wallet_code":"'${TVM_WALLET_CODE.TVM_WALLET_CODE}'","total_supply":"${total_supply}"}'
# $TONOS_CLI -u $NETWORK account $ROOT_ADDR | awk '/acc_type: /'
RESULT_DEPLOY=$($TONOS_CLI -u $NETWORK deploy ../$CONTRACTS/RootTokenContract.tvc $ROOT_DATA --abi ../$CONTRACTS/RootTokenContract.abi --sign ./RootWTON/deploy.keys.json --wc 0 | grep "Transaction" | cut -c 12-) 
echo Status Deploy: $RESULT_DEPLOY

ACCOUNT_STATUS=$($TONOS_CLI -u $NETWORK account $ROOT_ADDR | grep "acc_type:" | cut -c 10-)
echo Status account: $ACCOUNT_STATUS

