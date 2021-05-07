pragma ton-solidity ^0.42.0;
pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;

import "./DEXinterfaces.sol";

contract DEXclient is IDEXclient {

	address static public rootDEX;
	uint256 static public clientID;
	address static public wTONroot;
	address static public wTONwrapper;

	uint128 public test1;
	uint128 public test2;
	uint128 public test3;

	mapping(address => address) wallets;

	mapping(address => address) roots;
	address[] rootKeys;

	// Wrapper structure
	struct Wrapper {
		address root;
		address depositWallet;
	}

	mapping(address => Wrapper) wrappers;
	address[] wrappersKeys;

	// Pair structure
	struct Pair {
		uint256 index;
		address rootA;
		// address pairWalletA;
		address depositWalletA;
		address rootB;
		// address pairWalletB;
		address depositWalletB;
	}

	mapping(address => Pair) pairs;
	address[] pairKeys;

	// Grams constants
	uint128 constant GRAMS_CONNECT_PAIR = 2200000000;
	uint128 constant GRAMS_PROCESS_LIQUIDITY = 2200000000;
	uint128 constant GRAMS_PROCESS_SWAP = 1600000000;
	uint128 constant GRAMS_SENDTOKENS_TRANSMITER = 500000000;
	uint128 constant GRAMS_SENDTOKENS_RECEIVER = 300000000;
	uint128 constant GRAMS_PROCESS_RETURN = 220000000;
	uint128 constant GRAMS_ROOT_CREATE = 1000000000;
	uint128 constant GRAMS_NEW_WALLET = 500000000;
	uint128 constant GRAMS_GET_BALANCE = 220000000;
	uint128 constant GRAMS_UNWRAP = 220000000;

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

	// Modifier that allows public function to accept external calls only from the contract owner.
	modifier onlyOwnerWallets {
		require(wallets.exists(msg.sender), 107);
		tvm.accept();
		_;
	}

	// Init function.
	constructor() public {
		require(msg.sender == rootDEX, 102);
		test1 = msg.value;
	}

	// Function to transfers plain transfers.
	function sendTransfer(address dest, uint128 value, bool bounce) public pure checkOwnerAndAccept {
		dest.transfer(value, bounce, 3);
	}

	// Function to receive plain transfers.
	receive() external {
	}

	// Function to connect DEXclient to new DEXpair.
	function connectPair(address pairAddr) public checkOwnerAndAccept view  returns (bool statusConnection) {
		statusConnection = false;
		if (!pairs.exists(pairAddr)){
			TvmCell body = tvm.encodeBody(IDEXpair(pairAddr).connect);
			pairAddr.transfer({value:GRAMS_CONNECT_PAIR, body:body});
			statusConnection = true;
		}
	}

	// Function to connect DEXclient to new DEXpair with wallets Id.
	function connectPairWithId(address pairAddr, uint256 dwsIdA, uint256 cwsIdA, uint256 dwsIdB, uint256 cwsIdB) public checkOwnerAndAccept view  returns (bool statusConnection) {
		statusConnection = false;
		if (!pairs.exists(pairAddr)){
			TvmCell body = tvm.encodeBody(IDEXpair(pairAddr).connectWithId, dwsIdA, cwsIdA, dwsIdB, cwsIdB);
			pairAddr.transfer({value:GRAMS_CONNECT_PAIR, body:body});
			statusConnection = true;
		}
	}


	// Function private for internal create DEXclient wallet for specified TIP3 RootToken.
	function createNewEmptyWallet(address rootAddr, uint256 shardUINT) private view alwaysAccept  returns (bool createStatus) {
		createStatus = false;
		if (!roots.exists(rootAddr)){
			address creator = rootAddr;
			address owner = address(this);
			uint256 ownerUINT = owner.value;
			TvmCell body = tvm.encodeBody(IRootTokenContract(creator).deployEmptyWallet, 0x00000007, 0, shardUINT, ownerUINT, GRAMS_NEW_WALLET);
			creator.transfer({value:GRAMS_ROOT_CREATE, bounce:false, body:body});
			createStatus = true;
		}
	}

	// Function to create DEXclient wallet for specified TIP3 RootToken.
	function createNewEmptyWalletByOwner(address rootAddr) public view checkOwnerAndAccept  returns (bool createStatus) {
		createStatus = false;
		if (!roots.exists(rootAddr)){
			address creator = rootAddr;
			address owner = address(this);
			uint256 ownerUINT = owner.value;
			TvmCell body = tvm.encodeBody(IRootTokenContract(creator).deployEmptyWallet, 0x00000007, 0, 0, ownerUINT, GRAMS_NEW_WALLET);
			creator.transfer({value:GRAMS_ROOT_CREATE, bounce:false, body:body});
			createStatus = true;
		}
	}

	// Function to create DEXpair by DEXclient via DEXroot.
	function createNewPairByOwner(address root0, address root1, uint256 rws0, uint256 rws1, uint256 createId, uint128 grams) public checkOwnerAndAccept  returns (bool createStatus) {
		test2 = address(this).balance;
		createStatus = false;
		TvmCell body = tvm.encodeBody(IDEXroot(rootDEX).createDEXpair, root0, root1, rws0, rws1, createId);
		rootDEX.transfer({value:grams, bounce:false, body:body});
		createStatus = true;
		test3 = address(this).balance;
	}

	// Callback for new deployed wallet address setting.
	function setNewEmptyWallet(address value0) public override alwaysAccept functionID(0x00000007){
		address root = msg.sender;
		address wallet = value0;
		if (!roots.exists(root)){
			roots[root] = wallet;
			rootKeys.push(root);
			wallets[wallet] = root;
		}
	}

	// Function to get DEXclient wallet for specified TIP3 RootToken.
	function getWalletByRoot(address rootAddr) public view alwaysAccept returns (address wallet) {
		wallet = roots[rootAddr];
	}

	// Function to get DEXclient wallet for wrapped TON.
	function getAddressWTON() public view alwaysAccept returns (address wallet) {
		wallet = getWalletByRoot(wTONroot);
	}

	// Callback for DEXpair to set connection data.
	function setPair(address arg0, address arg1, address arg2, address arg3, uint256 arg4, uint256 arg5) public alwaysAccept override functionID(0x00000003) {
		address dexpair = msg.sender;
		Pair cp = pairs[dexpair];
		if (!pairs.exists(dexpair)){
			pairKeys.push(dexpair);
			cp.index = pairKeys.length;
			cp.rootA = arg0;
			// cp.pairWalletA = arg1;
			cp.depositWalletA = arg1;
			cp.rootB = arg2;
			// cp.pairWalletB = arg4;
			cp.depositWalletB = arg3;
			createNewEmptyWallet(cp.rootA,arg4);
			createNewEmptyWallet(cp.rootB,arg5);
			pairs[dexpair] = cp;
		}
	}

	// Callback for DEXpair to set deposit wallet for tokenA.
	function setPairDepositA(address arg0) public alwaysAccept override functionID(0x00000008) {
		address dexpair = msg.sender;
		Pair cp = pairs[dexpair];
		cp.depositWalletA = arg0;
		pairs[dexpair] = cp;
	}

	// Callback for DEXpair to set deposit wallet for tokenB.
	function setPairDepositB(address arg0) public alwaysAccept override functionID(0x00000009) {
		address dexpair = msg.sender;
		Pair cp = pairs[dexpair];
		cp.depositWalletB = arg0;
		pairs[dexpair] = cp;
	}

	// Function to get DEXpair connection data.
	function getPair(address value0) public view alwaysAccept returns (address pairRootA, address clientDepositA, address pairRootB, address clientDepositB, address curPair) {
		Pair cp = pairs[value0];
		pairRootA = cp.rootA;
		// pairReserveA = cp.pairWalletA;
		clientDepositA = cp.depositWalletA;
		pairRootB = cp.rootB;
		// pairReserveB = cp.pairWalletB;
		clientDepositB = cp.depositWalletB;
		curPair = value0;
	}

	// Function to send tokens by DEXclient. Only owner.
	function sendTokens(address from, address to, uint128 tokens, uint128 grams) public checkOwnerAndAccept pure returns (address transmitter, address receiver, TvmCell body) {
		transmitter = from;
		receiver = to;
		body = tvm.encodeBody(ITONTokenWallet(transmitter).transfer, receiver, tokens, grams);
		transmitter.transfer({value:GRAMS_SENDTOKENS_TRANSMITER, body:body});
	}

	// Function2 to send tokens by DEXclient. Only owner.
	function sendTokens2(address from, address to, uint128 tokens, uint128 grams) public checkOwnerAndAccept pure returns (address transmitter, address receiver) {
		transmitter = from;
		receiver = to;
		ITONTokenWallet(transmitter).transfer{value:GRAMS_SENDTOKENS_TRANSMITER}(receiver, tokens, grams);
	}

	// Function3 to send tokens by DEXclient. Only owner.
	function sendTokens3(address from, address to, uint128 tokens) public checkOwnerAndAccept pure returns (address transmitter, address receiver, TvmCell body) {
		transmitter = from;
		receiver = to;
		body = tvm.encodeBody(ITONTokenWallet(transmitter).transfer, receiver, tokens, GRAMS_SENDTOKENS_RECEIVER);
		transmitter.transfer({value:GRAMS_SENDTOKENS_TRANSMITER, body:body});
	}

	// Function to get DEXclient wallets from same roots as DEXpair. DEXclient internal_owner of this wallets.
	function getPairClientWallets(address pairAddr) public view alwaysAccept returns (address walletA, address walletB, address pairReturn){
		Pair cp = pairs[pairAddr];
		walletA = roots[cp.rootA];
		walletB = roots[cp.rootB];
		pairReturn = pairAddr;
	}

	// Function to get all connected pairs and created wallets of DEXclient.
	function getAllDataPreparation() public view alwaysAccept returns(address[] pairKeysR, address[] rootKeysR){
		pairKeysR = pairKeys;
		rootKeysR = rootKeys;
	}

	// Function to get DEXclient address.
	function showContractAddress() public pure alwaysAccept returns (address dexclient, uint256 dexclientUINT256){
		dexclient = address(this);
		dexclientUINT256 = dexclient.value;
	}

	// Function to make tokenA and tokenB deposit for DEXpair.
	function makeABdepositToPair(address pairAddr, uint128 qtyA, uint128 qtyB) public view checkOwnerAndAccept returns (bool makeDepositStatus) {
		makeDepositStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(cp.rootA != address(0) && cp.depositWalletA != address(0), 104);
		require(cp.rootB != address(0) && cp.depositWalletB != address(0), 105);
		sendTokens(roots[cp.rootA], cp.depositWalletA, qtyA, GRAMS_SENDTOKENS_RECEIVER);
		sendTokens(roots[cp.rootB], cp.depositWalletB, qtyB, GRAMS_SENDTOKENS_RECEIVER);
		makeDepositStatus = true;
	}

	// Function to make tokenA deposit for DEXpair.
	function makeAdepositToPair(address pairAddr, uint128 qtyA) public view checkOwnerAndAccept returns (bool makeDepositStatus) {
		makeDepositStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(cp.rootA != address(0) && cp.depositWalletA != address(0), 104);
		sendTokens(roots[cp.rootA], cp.depositWalletA, qtyA, GRAMS_SENDTOKENS_RECEIVER);
		makeDepositStatus = true;
	}

	// Function to make tokenB deposit for DEXpair.
	function makeBdepositToPair(address pairAddr, uint128 qtyB) public view checkOwnerAndAccept returns (bool makeDepositStatus) {
		makeDepositStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(cp.rootB != address(0) && cp.depositWalletB != address(0), 105);
		sendTokens(roots[cp.rootB], cp.depositWalletB, qtyB, GRAMS_SENDTOKENS_RECEIVER);
		makeDepositStatus = true;
	}

	// Function to return tokens from DEXpair deposits.
	function returnDepositFromPair(address pairAddr) public view checkOwnerAndAccept returns (bool returnDepositStatus) {
		returnDepositStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(roots.exists(cp.rootA) && roots.exists(cp.rootB), 103);
		TvmCell body = tvm.encodeBody(IDEXpair(pairAddr).returnDeposit, roots[cp.rootA], roots[cp.rootB]);
		pairAddr.transfer({value:GRAMS_PROCESS_RETURN, body:body});
		returnDepositStatus = true;
	}

	// Function to provide liquidity to DEXpair.
	function processLiquidity(address pairAddr, uint128 qtyA, uint128 qtyB) public view checkOwnerAndAccept returns (bool processLiquidityStatus) {
		processLiquidityStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(roots.exists(cp.rootA) && roots.exists(cp.rootB), 103);
		TvmCell body = tvm.encodeBody(IDEXpair(pairAddr).processLiquidity, qtyA, qtyB, roots[cp.rootA], roots[cp.rootB]);
		pairAddr.transfer({value:GRAMS_PROCESS_LIQUIDITY, body:body});
		processLiquidityStatus = true;
	}

	// Function to returm all liquidity from DEXpair.
	function returnAllLiquidity(address pairAddr) public view checkOwnerAndAccept returns (bool returnLiquidityStatus) {
		returnLiquidityStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(roots.exists(cp.rootA) && roots.exists(cp.rootB), 103);
		TvmCell body = tvm.encodeBody(IDEXpair(pairAddr).returnAllLiquidity);
		pairAddr.transfer({value:GRAMS_PROCESS_LIQUIDITY, body:body});
		returnLiquidityStatus = true;
	}

	// Function to swap tokenA.
	function processSwapA(address pairAddr, uint128 qtyA) public view checkOwnerAndAccept returns (bool processSwapStatus) {
		processSwapStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(roots.exists(cp.rootA) && roots.exists(cp.rootB), 103);
		TvmCell body = tvm.encodeBody(IDEXpair(pairAddr).processSwapA, qtyA, roots[cp.rootA], roots[cp.rootB]);
		pairAddr.transfer({value:GRAMS_PROCESS_SWAP, body:body});
		processSwapStatus = true;
	}

	// Function to swap tokenB.
	function processSwapB(address pairAddr, uint128 qtyB) public view checkOwnerAndAccept returns (bool processSwapStatus) {
		processSwapStatus = false;
		require(pairs.exists(pairAddr), 102);
		Pair cp = pairs[pairAddr];
		require(roots.exists(cp.rootA) && roots.exists(cp.rootB), 103);
		TvmCell body = tvm.encodeBody(IDEXpair(pairAddr).processSwapB, qtyB, roots[cp.rootA], roots[cp.rootB]);
		pairAddr.transfer({value:GRAMS_PROCESS_SWAP, body:body});
		processSwapStatus = true;
	}

	// Function to get balance TONgrams for DEXclient.
	function getBalanceTONgrams() public pure alwaysAccept returns (uint128 balanceTONgrams){
		return address(this).balance;
	}

	// Callback function for warpper.
	function setWrapper(address arg0, address arg1) public alwaysAccept override functionID(0x00000089) {
		address wrapper = msg.sender;
		if (!wrappers.exists(wrapper)){
			Wrapper cw = wrappers[wrapper];
			cw.root = arg0;
			cw.depositWallet = arg1;
			wrappers[wrapper] = cw;
			wrappersKeys.push(wrapper);
		}
	}

	// Function for check TONroot wallet.
	function checkTONrootWallet() public view returns (bool) {
		if (roots.exists(wTONroot)){
			return true;
		} else {
			return false;
		}
	}

	// Function for create TONroot wallet.
	function createTONrootWallet(uint256 clientId) public view returns (bool) {
		if (!checkTONrootWallet()){
			createNewEmptyWallet(wTONroot,clientId);
			return true;
		} else {
			return false;
		}
	}

	// Function for check TONwarpper.
	function checkTONWrapper() public view returns (bool) {
		if (wrappers.exists(wTONwrapper)) {
			return true;
		} else {
			return false;
		}
	}

	// Function for connect wrapper and wrap TON.
	function connectTONWrapperWithIdAndWrap(uint256 depositId, uint128 qtyTONgrams) public view checkOwnerAndAccept returns (bool processWrapStatus) {
		processWrapStatus = false;
		if (!checkTONWrapper() && checkTONrootWallet()) {
			require(!(qtyTONgrams > address(this).balance), 106);
			TvmCell body = tvm.encodeBody(ITONWrapper(wTONwrapper).connectWithIdAndWrapGrams,depositId, roots[wTONroot]);
			wTONwrapper.transfer({value:qtyTONgrams, body:body});
			processWrapStatus = true;
		}
	}

	// Function to wrap TON.
	function wrapTON(uint128 qtyTONgrams) public view checkOwnerAndAccept returns (bool processWrapStatus) {
		processWrapStatus = false;
		if (checkTONWrapper() && checkTONrootWallet()) {
			require(!(qtyTONgrams > address(this).balance), 106);
			TvmCell body = tvm.encodeBody(ITONWrapper(wTONwrapper).wrapGrams,roots[wTONroot]);
			wTONwrapper.transfer({value:qtyTONgrams, body:body});
			processWrapStatus = true;
		}
	}

	// Function to unwrap TON.
	function unwrapTON() public view checkOwnerAndAccept returns (bool processUnwrapStatus) {
		processUnwrapStatus = false;
		if (checkTONWrapper() && checkTONrootWallet()) {
			Wrapper cw = wrappers[wTONwrapper];
			address transmitter = roots[cw.root];
			TvmCell body = tvm.encodeBody(ITONTokenWallet(transmitter).getBalance_InternalOwner, 0x00000024);
			transmitter.transfer({value:GRAMS_GET_BALANCE, body:body});
			processUnwrapStatus = true;
		}
	}

	// Function to send tokens private
	function processTokens(address from, address to, uint128 tokens, uint128 grams) private pure inline {
		address transmitter = from;
		address receiver = to;
		TvmCell body = tvm.encodeBody(ITONTokenWallet(transmitter).transfer, receiver, tokens, grams);
		transmitter.transfer({value:GRAMS_SENDTOKENS_TRANSMITER, body:body});
	}

	// Callback for unwrap TON.
	function callbackUnwrapTON(uint128 value0) public onlyOwnerWallets override functionID(0x00000024) {
		address clientWallet = msg.sender;
		Wrapper cw = wrappers[wTONwrapper];
		address wrapperDepositWallet = cw.depositWallet;
		processTokens(clientWallet, wrapperDepositWallet, value0, GRAMS_SENDTOKENS_RECEIVER);
		TvmCell body = tvm.encodeBody(ITONWrapper(wTONwrapper).unwrapGrams);
		wTONwrapper.transfer({value:GRAMS_UNWRAP, body:body});
	}

}
