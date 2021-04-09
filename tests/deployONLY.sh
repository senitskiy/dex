#!/bin/sh

# ================================================================================
#
NETWORK=$(./configes/get_network.sh)
CONTRACTS=$(./configes/get_contracts.sh)
TVM_LINKER=$(./configes/get_tvm_linker.sh)
TONOS_CLI=$(./configes/get_tonos_cli.sh)

echo $NETWORK
echo $CONTRACTS
echo $TVM_LINKER
echo $TONOS_CLI
echo ====================================================

./deploy/_deploy1RootA.sh
# ./deploy/deploy1RootA.sh
# ./deploy/deploy2RootB.sh
# ./deploy/deploy3WTON.sh
# ./deploy/deploy4Root4WTON.sh

# ./deploy/deploy5pairA-B.sh
# ./deploy/deploy6pairB-WTON.sh
# ./deploy/deploy7client1.sh
# ./deploy/deploy8client2.sh
# ./deploy/deploy9connect-client1toPairA-B.sh
# ./deploy/_deploy9connect-client1toPairA-B.sh
# ./deploy/deploy10connect-client2toPairA-B.sh
