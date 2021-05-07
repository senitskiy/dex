pragma ton-solidity ^0.42.0;
pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;

import "./DEXinterfaces.sol";

contract TONWrapper is ITONWrapper {

	uint256 static public wrapperID;
	address public ROOT_WRAPPED_TON;
	address public addressZero;
	bool initStatus;

	// TON Wrapper clients deposit wallets data;
	mapping(address => address) tonwrapperclients;
	address[] tonwrapperclientKeys;

	// Queue struct
	struct Queue {
		address dexclient;
		address destination;
		uint128 qty;
	}

	// Queue router
	mapping(uint256 => Queue) queueRouter;

	// Queue data
	mapping(uint128 => uint256) rootQueue;

	// Process router data
	mapping(address => address) processRouter;

  // dwsId data
	mapping(uint256 => uint8) public dwsIds;

	// Grams constants
	uint128 constant GRAMS_CHECK_BALANCE = 22000000;
	uint128 constant GRAMS_SENDTOKENS_TRANSMITER = 500000000;
	uint128 constant GRAMS_SENDTOKENS_RECEIVER = 300000000;
	uint128 constant GRAMS_CREATE_ROOT = 1000000000;
	uint128 constant GRAMS_CREATE_NEWWALLET = 500000000;
	uint128 constant GRAMS_MINT = 220000000;
	uint128 constant GRAMS_GRANT = 240000000;
	uint128 constant GRAMS_GRANT_DEST = 120000000;
	uint128 constant GRAMS_DEXCLIENT_TWDWALLET = 120000000;

	// Modifier that allows public function to accept all external calls.
	modifier alwaysAccept {
		tvm.accept();
		_;
	}

	// Modifier that allows public function to accept external calls only from the contract owner.
	modifier checkOwnerAndAccept {
		require(msg.pubkey() == tvm.pubkey(), 102);
		tvm.accept();
		_;
	}

	function isRoot(address arg0) public view alwaysAccept returns (bool) {
		return arg0 == ROOT_WRAPPED_TON;
	}

	// Modifier that allows public function to accept external calls only from the DEXpair tokens.
	modifier onlyRoot {
		require(isRoot(msg.sender), 101);
		tvm.accept();
		_;
	}

	// Init function.
	constructor(address rootWrappedTON) public {
		require(checkAddress(rootWrappedTON), 105);
		require(tvm.pubkey() == msg.pubkey(), 102);
		tvm.accept();
		ROOT_WRAPPED_TON = rootWrappedTON;
		initStatus = false;
	}

	// Function to check address.
	function checkAddress(address _address) public pure alwaysAccept returns (bool) {
		return !_address.isStdZero() && !_address.isNone() && _address.isStdAddrWithoutAnyCast();
	}

	// Function to create once address for storage used wrappedTONgrams.
	function createZeroWallet(uint256 walletId) public view checkOwnerAndAccept {
		if (initStatus == false) {
			address creator = ROOT_WRAPPED_TON;
			address owner = address(this);
			uint256 ownerUINT = owner.value;
			TvmCell body = tvm.encodeBody(IRootTokenContract(creator).deployEmptyWallet, 0x00000126, 0, walletId, ownerUINT, GRAMS_CREATE_NEWWALLET);
			creator.transfer({value:GRAMS_CREATE_ROOT, bounce:false, body:body});
		}
	}

	// Callback function to set once address for storage used wrappedTONgrams.
	function setZeroWallet(address value0) public onlyRoot override functionID(0x00000126){
			addressZero = value0;
			initStatus = true;
	}

	// Function to transfers TONs.
	function sendTransfer(address dest, uint128 value, bool bounce) public pure checkOwnerAndAccept {
		dest.transfer(value, bounce, 3);
	}

	// Function to receive TONs.
	receive() external {
	}

	// Function to create random UINT256 for create different address for new wallets.
	function createWalletId() private pure returns (uint256) {
		rnd.shuffle();
		return rnd.getSeed();
	}

	// Function to create empty deposit wallet for DEX client.
	function createDepositWallet(address rootAddr, uint256 walletId) private pure inline {
		address creator = rootAddr;
		address owner = address(this);
		uint256 ownerUINT = owner.value;
		TvmCell body = tvm.encodeBody(IRootTokenContract(creator).deployEmptyWallet, 0x00000125, 0, walletId, ownerUINT, GRAMS_CREATE_NEWWALLET);
		creator.transfer({value:GRAMS_CREATE_ROOT, bounce:false, body:body});
	}

	// Function to get last DEX client in queue for creating empty deposit walletA.
	function getLastQueue() private view returns (uint128) {
		optional(uint128, uint256) rs = rootQueue.max();
		if (rs.hasValue()) {(uint128 number, ) = rs.get();return number;} else {return 0;}
	}

	// Function to get first DEX client in queue for creating empty deposit wallet.
	function getFirstQueue() private view returns (uint128) {
		optional(uint128, uint256) rs = rootQueue.min();
		if (rs.hasValue()) {(uint128 number, ) = rs.get();return number;} else {return 0;}
	}

	// Function to add DEX client at the end of queue for creating empty deposit wallet.
	function addDEXclientToQueue(address dexclient, address destination, uint128 qty) private returns (bool addStatus) {
		uint128 last = getLastQueue();
		last ++;
		uint256 queueID = createWalletId();
		Queue cq = queueRouter[queueID];
		cq.dexclient = dexclient;
		cq.destination = destination;
		cq.qty = qty;
		queueRouter[queueID] = cq;
		addStatus = rootQueue.add(last, queueID);
	}

	// Function to take first DEX client from the front of queue for creating empty deposit wallet.
	function takeFirstFromQueue() private returns (uint256) {
		optional(uint128, uint256) rs = rootQueue.delMin();
		if (rs.hasValue()) {( ,uint256 queueID) = rs.get();return queueID;} else {return 0;}
	}

	// Function to get length of DEX client queue for creating empty deposit walletA.
	function getLengthQueue() public view alwaysAccept returns (uint128 length) {
		uint128 first = getFirstQueue();
		uint128 last = getLastQueue();
		length = (last>=first)?last-first+1:0;
	}

	// Function to get DEX client queue for creating empty deposit walletA as address array.
	function getAllQueue() public view checkOwnerAndAccept returns (uint256[] queueArr) {
		uint128 first = getFirstQueue();
		uint128 last = getLastQueue();
		uint128 repeatQty = (last>=first)?last-first+1:0;
		uint128 count = first;
		repeat(repeatQty) {
			queueArr.push(rootQueue[count]);
			count++;
		}
	}

	// Function to get max from dwsIds data
	function getMaxDwsIds() public view  returns (uint256) {
		optional(uint256, uint8) rs = dwsIds.max();
		if (rs.hasValue()) {(uint256 number, ) = rs.get();return number;} else {return 0;}
	}

	function connectWithIdAndWrapGrams(uint256 dwsId, address destination)  public alwaysAccept override functionID(0x00000153) {
		address dexclient = msg.sender;
		uint128 wrappedTONgrams = msg.value;
		uint256 maxDwsIds = getMaxDwsIds();
		uint256 dwsIdShift = dwsId - maxDwsIds;
		if (!tonwrapperclients.exists(dexclient) && !dwsIds.exists(dwsId) && !(dwsIdShift>1000000)){
			tonwrapperclientKeys.push(dexclient);
			addDEXclientToQueue(dexclient, destination, wrappedTONgrams);
			createDepositWallet(ROOT_WRAPPED_TON, dwsId);
		}
	}

	// Function to wrap all income from DEX client TONgrams to wrappedTONgrams.
	function wrapGrams(address destination) public alwaysAccept override functionID(0x00000025) {
		address dexclient = msg.sender;
		uint128 wrappedTONgrams = msg.value;
		tvm.rawReserve(address(this).balance - wrappedTONgrams, 2);
		if (tonwrapperclients.exists(dexclient)){
			TvmCell bodyM = tvm.encodeBody(IRootTokenContract(ROOT_WRAPPED_TON).mint, wrappedTONgrams);
			ROOT_WRAPPED_TON.transfer({value:GRAMS_MINT, bounce:false, body:bodyM});
			TvmCell bodyG = tvm.encodeBody(IRootTokenContract(ROOT_WRAPPED_TON).grant, destination, wrappedTONgrams, GRAMS_GRANT_DEST);
			ROOT_WRAPPED_TON.transfer({value:GRAMS_GRANT, bounce:false, body:bodyG});
			dexclient.transfer({ value: 0, flag: 128 });
		} else {
			dexclient.transfer({ value: 0, flag: 128 });
		}
	}

	// Callback function to set DEX client empty deposit wallet by Root Token.
	function setDepositWallet(address value0) public override alwaysAccept functionID(0x00000125){
		address root = msg.sender;
		uint256 dexclientQueueID = takeFirstFromQueue();
		Queue cq = queueRouter[dexclientQueueID];
		address dexclient = cq.dexclient;
		address destination = cq.destination;
		uint128 wrappedTONgrams = cq.qty;
		tonwrapperclients[dexclient] = value0;
		TvmCell bodyM = tvm.encodeBody(IRootTokenContract(ROOT_WRAPPED_TON).mint, wrappedTONgrams);
		ROOT_WRAPPED_TON.transfer({value:GRAMS_MINT, bounce:false, body:bodyM});
		TvmCell bodyG = tvm.encodeBody(IRootTokenContract(ROOT_WRAPPED_TON).grant, destination, wrappedTONgrams, GRAMS_GRANT_DEST);
		ROOT_WRAPPED_TON.transfer({value:GRAMS_GRANT, bounce:false, body:bodyG});
		TvmCell body = tvm.encodeBody(IDEXclient(dexclient).setWrapper, root, value0);
		dexclient.transfer({value:GRAMS_DEXCLIENT_TWDWALLET, body:body});
	}

	// Function to unwrap all returned from DEX client wrappedTONgrams to TONgrams.
	function unwrapGrams() public alwaysAccept override functionID(0x00000052) {
		require(addressZero != address(0), 104);
		address dexclient = msg.sender;
		require(tonwrapperclients.exists(dexclient), 103);
		address depositwallet = tonwrapperclients[dexclient];
		TvmCell bodyA = tvm.encodeBody(ITONTokenWallet(depositwallet).getBalance_InternalOwner, 0x00000152);
		depositwallet.transfer({value:GRAMS_CHECK_BALANCE, body:bodyA});
		processRouter[depositwallet] = dexclient;
	}

	// Function to send tokens private
	function processTokens(address from, address to, uint128 tokens, uint128 grams) private pure inline {
		address transmitter = from;
		address receiver = to;
		TvmCell body = tvm.encodeBody(ITONTokenWallet(transmitter).transfer, receiver, tokens, grams);
		transmitter.transfer({value:GRAMS_SENDTOKENS_TRANSMITER, body:body});
	}

	// Callback function from client deposit wallet with  current balance data
	function balanceDepositWallet(uint128 value0) public alwaysAccept override functionID(0x00000152){
		address depositwallet = msg.sender;
		address dexclient = processRouter[depositwallet];
		uint128 currentbalance = value0;
		require(!(currentbalance > address(this).balance), 103);
		if (currentbalance > 0) {
			processTokens(depositwallet, addressZero, currentbalance, GRAMS_SENDTOKENS_RECEIVER);
			dexclient.transfer({value:currentbalance, bounce:false, flag:3});
		}
	}

	// Function to get balance TONgrams for TONwarapper.
	function getBalanceTONgrams() public pure alwaysAccept returns (uint128 balanceTONgrams){
		return address(this).balance;
	}

	// Function to get deposit wallet address for dexclient.
	function getDepositAddress(address dexclient) public view alwaysAccept returns (address dexclientDepositAddress){
		dexclientDepositAddress = tonwrapperclients[dexclient];
	}

	// Dev Function to mint wrappedTONgrams.
	// function mintRoot(uint128 wrappedTONgrams) public view checkOwnerAndAccept {
	// 	TvmCell bodyM = tvm.encodeBody(IRootTokenContract(ROOT_WRAPPED_TON).mint, wrappedTONgrams);
	// 	ROOT_WRAPPED_TON.transfer({value:GRAMS_MINT, bounce:false, body:bodyM});
	// }

	// Dev Function to grant wrappedTONgrams.
	// function grantRoot(address destination, uint128 wrappedTONgrams) public view checkOwnerAndAccept {
	// 	TvmCell bodyG = tvm.encodeBody(IRootTokenContract(ROOT_WRAPPED_TON).grant, destination, wrappedTONgrams, GRAMS_GRANT_DEST);
	// 	ROOT_WRAPPED_TON.transfer({value:GRAMS_GRANT, bounce:false, body:bodyG});
	// }

}