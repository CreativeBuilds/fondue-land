pragma solidity ^0.8.0;

// import ownable contract
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Test1155 is ERC1155 {
    constructor(address _mintTo) ERC1155("https://fondue.land/api/cheese_test/${id}.json") {
        _mint(_mintTo, 0, 1000, ""); 
    }
}