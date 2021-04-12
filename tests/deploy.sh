#!/bin/sh

# ================================================================================
#
NETWORK=$(./configes/get_network.sh)
CONTRACTS=$(./configes/get_contracts.sh)
TVM_LINKER=$(./configes/get_tvm_linker.sh)
TONOS_CLI=$(./configes/get_tonos_cli.sh)
CURRENT_DIR=$(./configes/create_current_dir.sh)

echo Конфигурация запуска:
echo Blockchain:                 $NETWORK
echo Directory contrcacts:       $CONTRACTS
echo Linker:                     $TVM_LINKER
echo Tonos-cli:                  $TONOS_CLI
echo Directory Address and keys: $CURRENT_DIR
# echo ====================================================

# ./deploy/deploy1RootA.sh
# ./deploy/deploy2RootB.sh
# ./deploy/deploy3WTON.sh
# ./deploy/deploy4Root4WTON.sh
# ./deploy/deploy5pairA-B.sh
# ./deploy/deploy6pairB-WTON.sh
# ./deploy/deploy7client1.sh
# ./deploy/deploy8client2.sh
./deploy/deploy9connect-client1toPairA-B.sh
./deploy/deploy10connect-client2toPairA-B.sh