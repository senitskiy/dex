pragma ton-solidity ^0.40.0;

contract Giver {
    function pay(address addr) public pure {
	    tvm.accept();
        addr.transfer(51000000000, false, 3);
    }
}