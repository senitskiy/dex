#!/bin/sh

# ================================================================================
#
NETWORK=$(./get_network.sh)
CONTRACTS=$(./get_contracts.sh)
TVM_LINKER=$(./get_tvm_linker.sh)
TONOS_CLI=$(./get_tonos_cli.sh)
# TONOS_CLI=$(./get_config.sh)
# TVM_LINKER=$(./get_config.sh)
# stringZ=abcABC123ABCabc
# echo ${stringZ:0}

echo $NETWORK
echo $CONTRACTS
echo $TVM_LINKER
echo $TONOS_CLI
# echo $(cat $VAR | grep public | cut -c 1-10)

# echo ${$VAR:3:7}
# echo ${VAR[0]}
# echo $VAR
# echo ${$VAR[2]}
# echo ${$VAR[3]}

AMOUNT_TONS=6000000000
GIVER="0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94"
# CODE=$($TVM_LINKER decode --tvc ../$CONTRACTS/RootTokenContract.tvc  | grep code: | cut -c 8-)
# KEYS_FILE="keysRTW1.json"
# PUBKEY=$(cat $KEYS_FILE | grep public | cut -c 14-77)
# ZERO_ADDRESS="0:0000000000000000000000000000000000000000000000000000000000000000"

# RTW_NAME=$(echo -n "Shilo" | xxd -p )
# RTW_SYMBOL=$(echo -n "SHL" | xxd -p )
# RTW_DECIMALS="9"
# RTW_OWNER_PK=$PUBKEY
# RTW_OWNER_ADDRESS=$ZERO_ADDRESS
# RTW_CODE=$CODE

# RTW_DATA='{"_name":"'$RTW_NAME'","_symbol":"'$RTW_SYMBOL'","_decimals":'$RTW_DECIMALS',"_rootPublicKey":"0x'$RTW_OWNER_PK'","_rootOwnerAddress":"'$ZERO_ADDRESS'","_code":"'$CODE'"}'

# NETWORK=$(./get_config.sh)

# # ================================================================================
# #
# # echo "get_rtw1"
# RTW_ADDRESS=$($TONOS_CLI genaddr --data $RTW_DATA ../$CONTRACTS/RTW_FT.tvc ../$CONTRACTS/RTW_FT.abi.json --setkey $KEYS_FILE --wc 0 --save | grep "Raw address:" | cut -c 14-)
# RTW_ADDRESS=$($TONOS_CLI genaddr --data $RTW_DATA ../$CONTRACTS/RTW_FT.tvc ../$CONTRACTS/RTW_FT.abi.json --setkey $KEYS_FILE --wc 0 --save | grep "Raw address:" | cut -c 14-)
# echo $RTW_ADDRESS