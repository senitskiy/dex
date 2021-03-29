#!/bin/sh

# ================================================================================
#
TTW_KEYS_FILE="keys$1.json"
PUBKEY_TTW=$(cat $TTW_KEYS_FILE | grep public | cut -c 14-77)
ZERO_ADDRESS="0:0000000000000000000000000000000000000000000000000000000000000000"

NETWORK=$(./get_url.sh)

# ================================================================================
#
RTW_ADDRESS=$(./get_rtw1_address.sh)
TTW_ADDRESS=$(./tonos-cli -u $NETWORK run $RTW_ADDRESS getWalletAddress '{"walletPublicKey":"0x'$PUBKEY_TTW'","ownerAddress":"'$ZERO_ADDRESS'"}' --abi ../contracts/RTW_FT.abi.json | grep "value0" | cut -c 14-79)


# TTW_ADDRESS=$(./tonos-cli run -u $NETWORK $RTW_ADDRESS getWalletAddress '{"walletPublicKey":"0x'$PUBKEY_TTW'","ownerAddress":"'$ZERO_ADDRESS'"}' --abi ../contracts/RTW_FT.abi.json | grep "value0" | cut -c 14-79)



# ./tonos-cli -u $NETWORK run '0:1a75902137ee3ed44cdd60a58fb40b799e788a08ab7d5630c89817eb03d0b91e' getWalletAddress '{"walletPublicKey":"0x'$PUBKEY_TTW'","ownerAddress":"'$ZERO_ADDRESS'"}' --abi ../contracts/RTW_FT.abi.json
# tonos-cli run <multisig_address> getTransactions {} --abi SafeMultisigWallet.abi.json


echo $TTW_ADDRESS