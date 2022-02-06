pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
interface IMinter is IERC1155 {
    event Claimed(uint256 index, address indexed account, uint256 indexed amount);
    event OwnershipTransferred(address indexed _previousOwner, address indexed _newOwner);
    event Paused(address indexed account);
    event Unpaused(address indexed account);
    function NFTs(uint256) external view returns (address);
    function addNFT(uint256 _windowOpens, uint256 _windowCloses, uint256 _mintPrice, string memory _JSONdata, ERC20 _purchaseToken, uint _maxSupply) external;
    function adminMint(uint256 index, uint256 amount) external;
}