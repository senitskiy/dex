pragma ton-solidity ^0.42.0;
pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;

import "./DEXinterfaces.sol";
import "./TONwrapper.sol";
import "./DEXroot.sol";

contract DEXoptimizer {

	TvmCell public codeTONwrapper;
	TvmCell public codeDEXroot;

	address public wrappedTONroot;

	// Modifier that allows public function to accept external calls always.
	modifier alwaysAccept {
		tvm.accept();
		_;
	}

	// Modifier that allows public function to accept external calls only from the contract owner.
	modifier checkOwnerAndAccept {
		require(msg.pubkey() == tvm.pubkey(), 101);
		tvm.accept();
		_;
	}

	// Init function.
	constructor(address wTONroot) public {
		require(tvm.pubkey() == msg.pubkey(), 102);
		tvm.accept();
		wrappedTONroot = wTONroot;
	}

	// Function to transfers plain transfers.
	function sendTransfer(address dest, uint128 value, bool bounce) public pure checkOwnerAndAccept {
		dest.transfer(value, bounce, 0);
	}

	// Function to receive plain transfers.
	receive() external {
	}

	function setTONwrapperCode(TvmCell code) public checkOwnerAndAccept {
		codeTONwrapper = code;
	}

	function setDEXrootCode(TvmCell code) public checkOwnerAndAccept {
		codeDEXroot = code;
	}

	function computeTONwrapperAddrWithId(uint256 pubkey, uint256 wrapperId) public view returns (address){
		TvmCell stateInit = tvm.buildStateInit({
			contr: TONWrapper,
			varInit: { wrapperID: wrapperId },
			code: codeTONwrapper,
			pubkey: pubkey
		});
		return address(tvm.hash(stateInit));
	}

	function computeDEXrootAddrWithId(uint256 pubkey, uint256 roootId) public view returns (address){
		TvmCell stateInit = tvm.buildStateInit({
			contr: DEXroot,
			varInit: { rootID: roootId },
			code: codeDEXroot,
			pubkey : pubkey
		});
		return address(tvm.hash(stateInit));
	}

	// Function to get balance TONgrams for DEXoptimizer.
	function getBalanceTONgrams() public pure returns (uint128 balanceTONgrams){
		return address(this).balance;
	}

}
