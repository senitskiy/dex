#!/bin/sh

# ================================================================================
#
NETWORK=$(./get_network.sh)
CONTRACTS=$(./get_contracts.sh)
TVM_LINKER=$(./get_tvm_linker.sh)
TONOS_CLI=$(./get_tonos_cli.sh)

echo $NETWORK
echo $CONTRACTS
echo $TVM_LINKER
echo $TONOS_CLI

./deployRootA.sh
./deployRootB.sh
./deployRootWTON.sh
# ./deploy_symbol2.sh
# ./deploy_factory.sh
# ./add_symbol1_to_dex.sh
# ./add_symbol2_to_dex.sh
# ./add_pair_1_2_to_dex.sh
# ./deploy_debot.sh