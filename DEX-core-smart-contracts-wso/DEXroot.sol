pragma ton-solidity ^0.42.0;
pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;

import "./DEXclient.sol";
import "./DEXpair.sol";
import "./DEXinterfaces.sol";

contract DEXroot is IDEXroot {

	uint256 static public rootID;

	TvmCell public codeDEXclient;
	TvmCell public codeDEXpair;

	address public wrappedTONroot;
	address public TONwrapper;

	uint128 public test1;
	uint128 public test2;
	uint128 public test3;
	uint128 public test4;
	uint128 public test5;

	mapping(address => mapping(address => address)) roots;

	// Pair structure
	struct Pair {
		address root0;
		address root1;
	}

	mapping(address => Pair) public pairs;
	address[] public pairKeys;

	mapping(uint256 => address) public pubkeys;
	mapping(address => uint256) public clients;
	address[] public clientKeys;

	// Grams constants
	uint128 constant public GRAMS_CREATE_DEX_CLIENT = 1.5 ton;
	uint128 constant public GRAMS_CREATE_DEX_PAIR = 1 ton;


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
	constructor(address wTONroot, address wTONwrapper) public {
		require(tvm.pubkey() == msg.pubkey(), 102);
		tvm.accept();
		wrappedTONroot = wTONroot;
		TONwrapper = wTONwrapper;
	}

	// Function to transfers plain transfers.
	function sendTransfer(address dest, uint128 value, bool bounce) public pure checkOwnerAndAccept {
		dest.transfer(value, bounce, 0);
	}

	// Function to receive plain transfers.
	receive() external {
	}

	function setDEXclientCode(TvmCell code) public checkOwnerAndAccept {
		codeDEXclient = code;
	}

	function setDEXpairCode(TvmCell code) public checkOwnerAndAccept {
		codeDEXpair = code;
	}

	function computeDEXclientAddrWithId(uint256 pubkey, uint256 clientId) public alwaysAccept view returns (address){
		TvmCell stateInit = tvm.buildStateInit({
			contr: DEXclient,
			varInit: {rootDEX:address(this),clientID:clientId,wTONroot:wrappedTONroot,wTONwrapper:TONwrapper},
			code: codeDEXclient,
			pubkey: pubkey
		});
		return address(tvm.hash(stateInit));
	}

	function createDEXclient(uint256 pubkey, uint256 clientId) public alwaysAccept returns (address deployedAddress, bool statusCreate){
		statusCreate = false;
		deployedAddress = address(0);
		TvmCell stateInit = tvm.buildStateInit({
			contr: DEXclient,
			varInit: {rootDEX:address(this),clientID:clientId,wTONroot:wrappedTONroot,wTONwrapper:TONwrapper},
			code: codeDEXclient,
			pubkey: pubkey
		});
		// deployedAddress = address(tvm.hash(stateInit));
		if (!pubkeys.exists(pubkey)){
				deployedAddress = new DEXclient{
					stateInit: stateInit,
					flag: 1,
					// bounce : false,
					value : GRAMS_CREATE_DEX_CLIENT
				}();
				pubkeys[pubkey] = deployedAddress;
				clients[deployedAddress] = pubkey;
				clientKeys.push(deployedAddress);
				statusCreate = true;
				test1 = address(this).balance;
		}
	}

	function computeDEXpairAddr(uint256 pubkey) public alwaysAccept view returns (address value0, uint256 createId){
		createId = 0;
		TvmCell stateInit = tvm.buildStateInit({
			contr: DEXpair,
			varInit: {rootDEX:address(this), pairID:createId},
			code: codeDEXpair,
			pubkey : pubkey
		});
		value0 = address(tvm.hash(stateInit));
	}

	function computeDEXpairAddrWithId(uint256 pubkey, uint256 pairId) public alwaysAccept view returns (address value0, uint256 createId){
		createId = pairId;
		TvmCell stateInit = tvm.buildStateInit({
			contr: DEXpair,
			varInit: {rootDEX:address(this), pairID:createId},
			code: codeDEXpair,
			pubkey : pubkey
		});
		value0 = address(tvm.hash(stateInit));
	}

	function createDEXpair(address root0, address root1, uint256 rws0, uint256 rws1, uint256 createId) public override alwaysAccept functionID(0x00000111){
		test2 = address(this).balance;
		test3 = msg.value;
		if (clients.exists(msg.sender) && !(msg.value<GRAMS_CREATE_DEX_PAIR) && !(root0 == root1) && !roots[root0].exists(root1) && !roots[root1].exists(root0)) {
			TvmCell stateInit = tvm.buildStateInit({
				contr: DEXpair,
				varInit: {rootDEX:address(this), pairID:createId},
				code: codeDEXpair,
				pubkey : clients[msg.sender]
			});
			// address computedAddress = address(tvm.hash(stateInit));
			// computedAddress.transfer(GRAMS_CREATE, false, 3);
			address deployedAddress = new DEXpair{
				stateInit: stateInit,
				// flag: 0,
				// bounce : false,
				value : GRAMS_CREATE_DEX_PAIR
			}(root0, root1, rws0, rws1);
			roots[root0][root1] = deployedAddress;
			roots[root1][root0] = deployedAddress;
			Pair cp = pairs[deployedAddress];
			cp.root0 = root0;
			cp.root1 = root1;
			pairs[deployedAddress] = cp;
			pairKeys.push(deployedAddress);
			test4 = address(this).balance;
		}
		test5 = address(this).balance;
	}

	function getPairByRoots01(address root0, address root1) public view alwaysAccept returns (address pairAddr) {
		pairAddr = roots[root0][root1];
	}

	function getPairByRoots10(address root1, address root0) public view alwaysAccept returns (address pairAddr) {
		pairAddr = roots[root1][root0];
	}

	function getRootsByPair(address pairAddr) public view alwaysAccept returns (address root0, address root1) {
		Pair cp = pairs[pairAddr];
    root0 = cp.root0;
		root1 = cp.root1;
	}

	function checkPubKey(uint256 pubkey) public view alwaysAccept returns (bool status, address dexclient) {
		status = pubkeys.exists(pubkey);
		dexclient = pubkeys[pubkey];
	}

	// Function to get balance TONgrams for DEXroot.
	function getBalanceTONgrams() public pure alwaysAccept returns (uint128 balanceTONgrams){
		return address(this).balance;
	}

}
