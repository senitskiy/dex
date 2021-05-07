pragma ton-solidity ^0.42.0;
pragma AbiHeader expire;

interface IRootTokenContract {
	function deployEmptyWallet(uint32 _answer_id, int8 workchain_id, uint256 pubkey, uint256 internal_owner, uint128 grams) external functionID(0x0000000d) returns (address value0);
	function mint(uint128 tokens) external functionID(0x0000000f);
	function grant(address dest, uint128 tokens, uint128 grams) external functionID(0x0000000e);
}

interface ITONTokenWallet {
	function transfer(address dest, uint128 tokens, uint128 grams) external functionID(0x0000000c);
	function getBalance_InternalOwner(uint32 _answer_id) external functionID(0x0000000d) returns (uint128 value0);
}

interface IDEXclient {
	function setPair(address arg0, address arg1, address arg2, address arg3, uint256 arg4, uint256 arg5) external functionID(0x00000003);
	function setNewEmptyWallet(address value0) external functionID(0x00000007);
	function setPairDepositA(address arg0) external functionID(0x00000008);
	function setPairDepositB(address arg0) external functionID(0x00000009);
	function setWrapper(address arg0, address arg1) external functionID(0x00000089);
	function callbackUnwrapTON(uint128 value0) external functionID(0x00000024);
}

interface IDEXpair {
	function connect() external functionID(0x00000005);
	function connectWithId(uint256 dwsIdA, uint256 cwsIdA, uint256 dwsIdB, uint256 cwsIdB) external functionID(0x00000055);
	function setPairDepositWallet(address value0) external functionID(0x0000000a);
	function setPairReserveWallet(address value0) external functionID(0x0000000b);
	function processLiquidity(uint128 qtyA, uint128 qtyB, address returnAddrA, address returnAddrB) external functionID(0x00000011);
	function responceClientBalanceA(uint128 value0) external functionID(0x00000016);
	function responceClientBalanceB(uint128 value0) external functionID(0x00000026);
	function processSwapA(uint128 qtyA, address returnAddrA, address returnAddrB) external functionID(0x00000012);
	function processSwapB(uint128 qtyB, address returnAddrA, address returnAddrB) external functionID(0x00000021);
	function returnDeposit(address returnAddrA, address returnAddrB) external functionID(0x00000018);
	function returnClientDepositA(uint128 value0) external functionID(0x00000036);
	function returnClientDepositB(uint128 value0) external functionID(0x00000046);
	function swapA(uint128 value0) external functionID(0x00000056);
	function swapB(uint128 value0) external functionID(0x00000066);
	function returnAllLiquidity() external functionID(0x00000019);
}

interface ITONWrapper {
	function connectWithIdAndWrapGrams(uint256 dwsId, address destination) external functionID(0x00000153);
	function wrapGrams(address destination) external functionID(0x00000025);
	function unwrapGrams() external functionID(0x00000052);
	function setDepositWallet(address value0) external functionID(0x00000125);
	function setZeroWallet(address value0) external functionID(0x00000126);
	function balanceDepositWallet(uint128 value0) external functionID(0x00000152);
}

interface IDEXroot {
	function createDEXpair(address root0, address root1, uint256 rws0, uint256 rws1, uint256 createId) external functionID(0x00000111);
}
