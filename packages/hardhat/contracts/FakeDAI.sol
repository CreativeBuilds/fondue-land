pragma solidity ^0.8.0;

import "./token/ERC20.sol";

// mock DAI contract erc20
contract FakeDAI is ERC20 {
    constructor() ERC20("FakeDAI", "FAKE", 18) {
        _mint(0xB72C0Bd8e68De7de2Bf99abe238Ad7d18F9daaF7, 100000 * 10 ** 18);
    }
}