#!/bin/sh

NETWORK=$(./configes/get_network.sh)
CONTRACTS=$(./configes/get_contractsAB.sh)
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
KEYS_FILE="./client1/deploy.keys.json"
PUBKEY=$(cat $KEYS_FILE | grep public | cut -c 14-77)


# CODE=$(./tvm_linker decode --tvc ../contracts/TTW_FT.tvc  | grep code: | cut -c 8-)

ROOT_NAME=$(echo -n "RootA" | xxd -p )
ROOT_SYMBOL=$(echo -n "RTA" | xxd -p )
ROOT_DECIMALS="9"
ROOT_OWNER_PK=$PUBKEY
ROOT_OWNER=0
ROOT_OWNER_ADDRESS=$ZERO_ADDRESS
ROOT_CODE=$CODE
TOTAL_SUPPLY="1000000" 

# ROOT_DATA='{"_name":"'$ROOT_NAME'","_symbol":"'$ROOT_SYMBOL'","_decimals":'$ROOT_DECIMALS',"_rootPublicKey":"0x'$ROOT_OWNER_PK'","_rootOwnerAddress":"'$ZERO_ADDRESS'","_code":"'$CODE'"}'
echo ========================================================================
echo Connect client2 to pairA_B

CLIENT_ADDR_FILE="./client2/address.json"
CLIENT_ADDR=$(cat $CLIENT_ADDR_FILE | grep address | cut -c 15-80)
echo client-1: $CLIENT_ADDR



pairA_B_FILE="./pairA-B/address.json"
pairA_B=$(cat $pairA_B_FILE | grep address | cut -c 15-80)
# echo wTONroot: $wTONroot

# wTONwrapper_FILE="./WTON/address.json"
# wTONwrapper=$(cat $wTONwrapper_FILE | grep address | cut -c 15-80)
# echo wTONwrapper: $wTONwrapper

# $TONOS_CLI -u $NETWORK call $GIVER sendGrams "{\"dest\":\"$CLIENT_ADDR\",\"amount\":\"$AMOUNT_TONS\"}" --abi ./local_giver.abi.json > /dev/null
# $TONOS_CLI -u $NETWORK call $GIVER sendGrams "{\"dest\":\"$ROOT_ADDR\",\"amount\":\"$AMOUNT_TONS\"}" --abi ./local_giver.abi.json > /dev/null

ROOT_DATA='{"pairAddr":"'$pairA_B'"}'


# '{"name":"${nameRootTokenHex}","symbol":"${symbolRootTokenHex}", "decimals":"${decimals}","root_public_key":"0x${contractKeysPublic}", "root_owner":"${root_owner}", "wallet_code":"'${TVM_WALLET_CODE.TVM_WALLET_CODE}'","total_supply":"${total_supply}"}'
# root0, address root1
# RESULT_DEPLOY=$($TONOS_CLI -u $NETWORK deploy --abi ./sol/DEXclient.abi.json --sign ./client1/deploy.keys.json ./sol/DEXclient.tvc $ROOT_DATA --wc 0 | grep "Transaction" | cut -c 12-)
# RESULT_DEPLOY=$($TONOS_CLI -u $NETWORK deploy ./sol/DEXclient.tvc {} --abi ./sol/DEXclient.abi.json --sign ./client1/deploy.keys.json --wc 0 | grep "Transaction" | cut -c 12-) 
RESULT_DEPLOY=$($TONOS_CLI -u $NETWORK call --abi ./sol/DEXclient.abi.json --sign ./client2/deploy.keys.json $CLIENT_ADDR connectPair $ROOT_DATA | grep "statusConnection" | cut -c 22-)

# $TONOS_CLI -u $NETWORK account $CLIENT_ADDR | awk '/acc_type: /'

# RESULT_DEPLOY=$($TONOS_CLI -u $NETWORK deploy ./sol/DEXpair.tvc $ROOT_DATA --abi ./sol/DEXpair.abi.json --sign ./pairB-WTON/deploy.keys.json --wc 0 | grep "Transaction" | cut -c 12-) 
echo Status connect client-1 to pairA_B: $RESULT_DEPLOY

