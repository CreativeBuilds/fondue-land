// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import ownable contract
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

/**
 * @title FondueTickets
 * @dev An ERC1155 contract that issues tickets for cheez 
 * @dev users enter tickets, last ticket to enter is winner
 * @dev each ticket added adds 5 minutes to the pots timer and increases the price to mint further tickets

    * SALE / MINT INFO *
 * @dev the presale will last for 50000 blocks or until 1k mice are raised
 * @dev mice will be sent to treasury addressed to be staked in the maze

    * POT INFO *
 * @dev the pot will be a seperate contract that will be released seperately after the initial minting
 */ 

abstract contract FondueTickets is ERC1155, ERC1155Receiver, Ownable {
    ERC1155 public MouseContract;
    uint256 public constant TICKET = 0;

    uint public CHEEZ_PRICE = 5000; // out of 10000 (0.5 CHEEZ)
    uint public INCREMENT_PRICE_BY = 5;  // out of 10000 (0.0005 CHEEZ)
    uint public presaleStartBlock;
    bool public _isPresale = false;

    mapping (address => uint256) public tickets;
    uint public totalTicketsMinted = 0;
    uint public totalTicketsMintedAtPresale = 0;

    IERC20 public CheezToken;
    address public treasury;

    uint public maxTicketsFromPresale = 24000;
    uint public ticketsPerMouse = 24;

    event TicketPurchase(address purchaser, uint256 value, uint256 cost, bool isPresale);

    modifier isInPresale {
        require(block.number > presaleStartBlock && block.number < presaleStartBlock + 50000 && totalTicketsMintedAtPresale < maxTicketsFromPresale, "Presale is over");
        _;
    }
    
    constructor(uint256 _presaleStartBlock, ERC1155 _MouseContract, IERC20 _cheezToken, address _treasury) ERC1155("https://fondue.land/api/token/1/${id}.json") {
        require(_presaleStartBlock > block.number + 1);
        presaleStartBlock = _presaleStartBlock;
        MouseContract = _MouseContract;
        CheezToken = _cheezToken;
        treasury = _treasury;
    }

    // @dev calculates average ticket cost and optimistically transfers tokens to the pot 
    function purchaseWithCheese(uint256 _value) external {
        uint256 currentPrice = getPrice(totalTicketsMinted);
        uint256 priceAfter = getPrice(totalTicketsMinted + (_value-1));

        uint256 avgPurchasePrice = (priceAfter + currentPrice) / 2;
        uint256 cheeseCost = avgPurchasePrice * _value;

        CheezToken.transferFrom(msg.sender, address(this), cheeseCost);
        _mint(msg.sender, TICKET, _value, "");
        emit TicketPurchase(msg.sender, _value, cheeseCost, false);
    }

    function purchaseWithTraps(uint256 _value) external isInPresale  {
        MouseContract.safeTransferFrom(msg.sender, address(this), 1, _value, "");
    }

    function totalTicketSupply() public view returns(uint256)  {
        return totalTicketsMinted + totalTicketsMintedAtPresale;
    }

    function setPresale (bool isPresale) public onlyOwner {
        _isPresale = isPresale;
    }

    function getPrice(uint256 amountMinted) public view returns(uint256) {
        return ((CHEEZ_PRICE + (INCREMENT_PRICE_BY * amountMinted)) * 10 ** 9) / 10000;
    }


    /**
     * @dev Mints tickets per each mouse sent
     */
    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) override public isInPresale returns (bytes4) {
        require(operator == address(MouseContract), "unauthorized");
        require(id == 1, "incorrect nft");
        require(value > 0, "invalid value");
        require(value <= 20, "max per tx is 20 mice");

        uint amountToMint = ticketsPerMouse * value;
        totalTicketsMintedAtPresale += amountToMint;
        _mint(from, 0, amountToMint, "");
        emit TicketPurchase(from, value, 0, true);
        
        return bytes4(keccak256("onERC1155Received(address,address,uint256[],uint256[],bytes)"));
    }

    function supportsInterface(bytes4 interfaceID) override(ERC1155, ERC1155Receiver) public pure returns (bool) {
        return true;
    }
}