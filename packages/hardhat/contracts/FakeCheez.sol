pragma solidity >=0.8.0 <0.9.0;
// import ERC20.sol from open zeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeCheez is ERC20 {
    constructor() ERC20("FakeCheez", "fCHEEZ") public {
        // initialize the contract and mint (1,000,000,000) to msg.sender
        _mint(msg.sender, 1000000000 * 10**9);
    }   

    // override erc20 decimals
    function decimals() override public view returns (uint8) {
        return 9;
    }
}