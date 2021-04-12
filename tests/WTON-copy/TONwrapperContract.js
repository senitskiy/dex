const TONwrapperContract = {
    abi: {
        "ABI version": 2,
        "header": [
            "time",
            "expire"
        ],
        "functions": [
            {
                "name": "constructor",
                "inputs": [
                    {
                        "name": "rootWrappedTON",
                        "type": "address"
                    }
                ],
                "outputs": []
            },
            {
                "name": "isRoot",
                "inputs": [
                    {
                        "name": "arg0",
                        "type": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "value0",
                        "type": "bool"
                    }
                ]
            },
            {
                "name": "checkAddress",
                "inputs": [
                    {
                        "name": "_address",
                        "type": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "value0",
                        "type": "bool"
                    }
                ]
            },
            {
                "name": "createZeroWallet",
                "inputs": [],
                "outputs": []
            },
            {
                "name": "setZeroWallet",
                "id": "0x126",
                "inputs": [
                    {
                        "name": "value0",
                        "type": "address"
                    }
                ],
                "outputs": []
            },
            {
                "name": "getZeroAddress",
                "inputs": [],
                "outputs": [
                    {
                        "name": "walletZero",
                        "type": "address"
                    }
                ]
            },
            {
                "name": "sendTransfer",
                "inputs": [
                    {
                        "name": "dest",
                        "type": "address"
                    },
                    {
                        "name": "value",
                        "type": "uint128"
                    },
                    {
                        "name": "bounce",
                        "type": "bool"
                    }
                ],
                "outputs": []
            },
            {
                "name": "getLengthQueue",
                "inputs": [],
                "outputs": [
                    {
                        "name": "length",
                        "type": "uint128"
                    }
                ]
            },
            {
                "name": "getAllQueue",
                "inputs": [],
                "outputs": [
                    {
                        "name": "queueArr",
                        "type": "uint256[]"
                    }
                ]
            },
            {
                "name": "wrapGrams",
                "id": "0x25",
                "inputs": [
                    {
                        "name": "destination",
                        "type": "address"
                    }
                ],
                "outputs": []
            },
            {
                "name": "setDepositWallet",
                "id": "0x125",
                "inputs": [
                    {
                        "name": "value0",
                        "type": "address"
                    }
                ],
                "outputs": []
            },
            {
                "name": "unwrapGrams",
                "id": "0x52",
                "inputs": [],
                "outputs": []
            },
            {
                "name": "balanceDepositWallet",
                "id": "0x152",
                "inputs": [
                    {
                        "name": "value0",
                        "type": "uint128"
                    }
                ],
                "outputs": []
            },
            {
                "name": "getBalanceTONgrams",
                "inputs": [],
                "outputs": [
                    {
                        "name": "balanceTONgrams",
                        "type": "uint128"
                    }
                ]
            },
            {
                "name": "getDepositAddress",
                "inputs": [
                    {
                        "name": "dexclient",
                        "type": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "dexclientDepositAddress",
                        "type": "address"
                    }
                ]
            }
        ],
        "data": [],
        "events": []
    },
    tvc: "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",
};
module.exports = { TONwrapperContract };