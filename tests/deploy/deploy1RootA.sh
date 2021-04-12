#!/bin/sh

NETWORK=$(./configes/get_network.sh)
CONTRACTS=$(./configes/get_contracts.sh)
TVM_LINKER=$(./configes/get_tvm_linker.sh)
TONOS_CLI=$(./configes/get_tonos_cli.sh)
CURRENT_DIR=$(./configes/get_current_dir.sh)

echo $CURRENT_DIR

AMOUNT_TONS=6000000000
# GIVER=
# CODE=$($TVM_LINKER decode --tvc ../$CONTRACTS/RootTokenContract.tvc  | grep code: | cut -c 8-)
# CODE=$($TVM_LINKER decode --tvc ../$CONTRACTS/RootTokenContract.tvc | grep code: | cut -c 8-)
CODE=$(cat ./code.txt) #export TVM_WALLET_CODE=`cat code.txt`
# KEYS_FILE="./RootA/deploy.keys.json"
# PUBKEY=$(cat $KEYS_FILE | grep public | cut -c 14-77)


# CODE=$(./tvm_linker decode --tvc ../contracts/TTW_FT.tvc  | grep code: | cut -c 8-)

ROOT_NAME=$(echo -n "RootA" | xxd -p )
ROOT_SYMBOL=$(echo -n "RTA" | xxd -p )
ROOT_DECIMALS="9"
# ROOT_OWNER_PK=$PUBKEY
ROOT_OWNER=0
ROOT_OWNER_ADDRESS=$ZERO_ADDRESS
ROOT_CODE=$CODE
TOTAL_SUPPLY="1000000" 
echo ========================================================================
echo Deploy Root A





# DIR=$(date +"%Y-%m-%d-%k%M%S" | cut -c 1-17)
# CURRENT_DIR="./addrsAndKeys/"${DIR}
# echo Directory Address and keys: $CURRENT_DIR
# mkdir $CURRENT_DIR

# SEED_PHRASE=$($TONOS_CLI -u $NETWORK genphrase | grep phrase | cut -c 14-110 ) #| tr -d \")
# # SEED_PHRASE=$(tonos-cli genphrase | grep phrase | cut -c 14-110)
# # SEED_PHRASE_=${$SEED_PHRASE/"\""/}
# echo $SEED_PHRASE

mkdir $CURRENT_DIR/RootA
# $TONOS_CLI -u $NETWORK getkeypair $CURRENT_DIR/RootA/deploy.keys.json $SEED_PHRASE #"there screen toddler confirm spring future grief loan wait ready accuse card" # $SEED_PHRASE #| grep Succeeded | cut -c 1-15
# tonos-cli getkeypair ./addrsAndKeys/RootA/deploy.keys.json "age rescue knock load gaze erupt zoo elevator romance basic polar august" | grep Succeeded | cut -c 1-15

ROOT_ADDR=$($TONOS_CLI -u $NETWORK genaddr ../$CONTRACTS/RootTokenContract.tvc ../$CONTRACTS/RootTokenContract.abi.json --genkey $CURRENT_DIR/RootA/deploy.keys.json --wc 0 | grep "Raw address:" | cut -c 14-)
# tonos-cli genaddr ../DEXrootAndWalletcompile/RootTokenContract.tvc ../DEXrootAndWalletcompile/RootTokenContract.abi.json --genkey ./addrsAndKeys/2021-04-12-150601/RootA/deploy.keys.json --wc 0

echo { \"address\": \"$ROOT_ADDR\"} > $CURRENT_DIR/RootA/address.json

KEYS_FILE="$CURRENT_DIR/RootA/deploy.keys.json"
PUBKEY=$(cat $KEYS_FILE | grep public | cut -c 14-77)
ROOT_OWNER_PK=$PUBKEY

echo Public key: $ROOT_OWNER_PK
# { "address": "0:549f228b3c5e0e3606cd19a67493328a0a85e3e5a5c23972f49a7a1bc6de6c8b"}


# ROOT_ADDR_FILE="./RootA/address.json"
# ROOT_ADDR=$(cat $ROOT_ADDR_FILE | grep address | cut -c 15-80)

echo Waiting. Transaction from Giver...

if [ $NETWORK = "http://127.0.0.1" ]
then
    $TONOS_CLI -u $NETWORK call 0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94 sendGrams "{\"dest\":\"$ROOT_ADDR\",\"amount\":\"$AMOUNT_TONS\"}" --abi ./local_giver.abi.json > /dev/null
elif [ $NETWORK = "https://net.ton.dev" ]
then
    GIVER_RESULT=$($TONOS_CLI -u $NETWORK call 0:2225d70ebde618b9c1e3650e603d6748ee6495854e7512dfc9c287349b4dc988 pay '{"addr":"'$ROOT_ADDR'"}' --abi ./giver.abi.json  | grep "Succeeded" | cut -c 1-)
fi

echo Result transaction from Giver: $GIVER_RESULT

echo RootA: $ROOT_ADDR

ROOT_DATA='{"name":"'$ROOT_NAME'","symbol":"'$ROOT_SYMBOL'","decimals":"'$ROOT_DECIMALS'","root_public_key":"0x'$ROOT_OWNER_PK'","root_owner":"'$ROOT_OWNER'","wallet_code":"'$ROOT_CODE'","total_supply":"'$TOTAL_SUPPLY'"}'
# '{"name":"${nameRootTokenHex}","symbol":"${symbolRootTokenHex}", "decimals":"${decimals}","root_public_key":"0x${contractKeysPublic}", "root_owner":"${root_owner}", "wallet_code":"'${TVM_WALLET_CODE.TVM_WALLET_CODE}'","total_supply":"${total_supply}"}'


# $TONOS_CLI -u $NETWORK deploy ../$CONTRACTS/RootTokenContract.tvc $ROOT_DATA --abi ../$CONTRACTS/RootTokenContract.abi --sign ./RootA/deploy.keys.json --wc 0
echo Waiting. Deploy Root from Blockchain...
RESULT_DEPLOY=$($TONOS_CLI -u $NETWORK deploy ../$CONTRACTS/RootTokenContract.tvc $ROOT_DATA --abi ../$CONTRACTS/RootTokenContract.abi.json --sign $CURRENT_DIR/RootA/deploy.keys.json --wc 0 | grep "Transaction" | cut -c 12-) #| awk '/Transaction /')

echo Status Deploy: $RESULT_DEPLOY
# ./tonos-cli -u "http://127.0.0.1" call "0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94" sendGrams "{\"dest\":\"0:b91e58c842b3fa41b644b96af57f83b458e4a02242aa0ec47b1f90776559b21b\",\"amount\":\"10000000000\"}" --abi ./local_giver.abi.json

# export TVM_WALLET_CODE=`cat code.txt`

# ./tonos-cli -u "http://127.0.0.1" deploy ../DEX-core-smart-contracts/RootTokenContract.tvc '{"name":"526f6f7441","symbol":"525441", "decimals":"9","root_public_key":"0x6f890c589d1501024e09a905c87f4787174854d793b6d2233a70fbebedf861d3", "root_owner":"0", "wallet_code":"'$TVM_WALLET_CODE'","total_supply":"1000000"}' --abi ../DEX-core-smart-contracts/RootTokenContract.abi --sign ./RootA/deploy.keys.json --wc 0

# ./tonos-cli -u "http://127.0.0.1" genaddr ../DEX-core-smart-contracts/RootTokenContract.tvc ../DEX-core-smart-contracts/RootTokenContract.abi --setkey ./RootA/deploy.keys.json --wc 0


ACCOUNT_STATUS=$($TONOS_CLI -u $NETWORK account $ROOT_ADDR | grep "acc_type:" | cut -c 10-)
echo Status account: $ACCOUNT_STATUS

GETNAME=$($TONOS_CLI -u $NETWORK run $ROOT_ADDR getName {} --abi ../$CONTRACTS/RootTokenContract.abi.json | grep "value0" | cut -c 13-)
echo Name Root: $(echo -n $GETNAME | xxd -r -p)

GETSYMBOL=$($TONOS_CLI -u $NETWORK run $ROOT_ADDR getSymbol {} --abi ../$CONTRACTS/RootTokenContract.abi.json | grep "value0" | cut -c 13-)
echo Symbol Root: $(echo -n $GETSYMBOL | xxd -r -p)

GETDECIMALS=$($TONOS_CLI -u $NETWORK run $ROOT_ADDR getDecimals {} --abi ../$CONTRACTS/RootTokenContract.abi.json | grep "value0" | cut -c 13-)
echo Decimals Root: $GETDECIMALS

GETROOTKEY=$($TONOS_CLI -u $NETWORK run $ROOT_ADDR getRootKey {} --abi ../$CONTRACTS/RootTokenContract.abi.json | grep "value0" | cut -c 13-)
echo Root key: $GETROOTKEY

GETTOTALSUPPLY=$($TONOS_CLI -u $NETWORK run $ROOT_ADDR getTotalSupply {} --abi ../$CONTRACTS/RootTokenContract.abi.json | grep "value0" | cut -c 13-)
echo Total supply: $GETTOTALSUPPLY

GETTOTALGRANTED=$($TONOS_CLI -u $NETWORK run $ROOT_ADDR getTotalGranted {} --abi ../$CONTRACTS/RootTokenContract.abi.json | grep "value0" | cut -c 13-)
echo Total granted: $GETTOTALGRANTED

# GETWALLETADDRESS=$($TONOS_CLI -u $NETWORK run $ROOT_ADDR getWalletAddress {} --abi ../$CONTRACTS/RootTokenContract.abi | grep "value0" | cut -c 13-)
# echo Total granted: $GETWALLETADDRESS

