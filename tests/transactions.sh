#!/bin/sh

# ================================================================================
#
NETWORK=$(./configes/get_network.sh)
CONTRACTS=$(./configes/get_contracts.sh)
TVM_LINKER=$(./configes/get_tvm_linker.sh)
TONOS_CLI=$(./configes/get_tonos_cli.sh)

echo Конфигурация запуска:
echo Blockchain:            $NETWORK
echo Directory contrcacts:  $CONTRACTS
echo Linker:                $TVM_LINKER
echo Tonos-cli:             $TONOS_CLI
# echo ====================================================

./transactions/transaction1.sh
