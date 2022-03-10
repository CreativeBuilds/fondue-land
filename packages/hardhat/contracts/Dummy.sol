pragma solidity ^0.8.0;

contract Dummy {
    constructor() {}

    function test() public pure returns (bytes4) {
        return bytes4(keccak256("setPaymentToken(address)"));
    }
}