// contracts/MyContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import ownable contract
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FondueTickets
 * @dev An ERC1155 contract that issues tickets for cheez 
 * @dev users enter tickets, last ticket to enter is winner
 * @dev each ticket added adds 5 minutes to the pots timer and increases the price to mint further tickets

    * SALE / MINT INFO *
 * @dev the presale will last for totalBlocksToMint (50000) blocks or until 1k mice are raised
 * @dev mice will be sent to treasury addressed to be staked in the maze

    * POT INFO *
 * @dev the pot will be a seperate contract that will be released seperately after the initial minting
 */ 

contract FondueTickets is ERC1155, IERC1155Receiver, Ownable {
    ERC1155 public MouseContract = ERC1155(0x4e9c30CbD786549878049f808fb359741BF721ea);
    uint256 public constant TICKET = 0;

    uint public CHEEZ_PRICE = 5000; // out of 10000 (0.5 DAI)
    uint public INCREMENT_PRICE_BY = 1;  // out of 10000 (0.0001 DAI increment)
    uint public presaleStartBlock;
    bool public _isPresale = false;

    mapping (address => uint256) public tickets;
    uint public totalTicketsMinted = 0;
    uint public totalTicketsMintedAtPresale = 0;

    IERC20 public DAI = IERC20(0xEf977d2f931C1978Db5F6747666fa1eACB0d0339);
    address public treasury = address(0xD9d54CFFe5BbBb0633AEc3739488dfD0a00BeF5E);
 
    uint public totalBlocksToMint = 117750;
    uint public maxTicketsFromPresale = 25000;
    uint public ticketsPerMouse = 50;
    uint public maxMicePerTx = 100;

    event TicketPurchase(address purchaser, uint256 value, uint256 cost, bool isPresale); // cost is used post-presale (presale will be 0)

    modifier isInPresale {
        require(block.number > presaleStartBlock && block.number < presaleStartBlock + totalBlocksToMint && totalTicketsMintedAtPresale < maxTicketsFromPresale, "Presale is over");
        _;
    }

    modifier isAfterPresale {
        require(block.number > presaleStartBlock + totalBlocksToMint || totalTicketsMinted > maxTicketsFromPresale, "Presale is over");
        _;
    }
    
    constructor(uint256 _presaleStartBlock) ERC1155("https://fondue.land/api/token/${id}.json") {
        if(_presaleStartBlock >= block.number) {
            presaleStartBlock = _presaleStartBlock;
        } else {
            presaleStartBlock = block.number;
        }
    }

    function timeTillPresaleEnds() public view isInPresale returns (uint)  {
        return presaleStartBlock + totalBlocksToMint - block.number;
    }

    // @dev calculates average ticket cost and optimistically transfers tokens to the pot 
    function purchaseWithDai(uint256 _value) external isAfterPresale {
        uint256 currentPrice = getPrice(totalTicketsMinted);
        uint256 priceAfter = getPrice(totalTicketsMinted + (_value-1));

        uint256 avgPurchasePrice = (priceAfter + currentPrice) / 2;
        uint256 keyCost = avgPurchasePrice * _value;

        DAI.transferFrom(msg.sender, address(this), keyCost);
        _mint(msg.sender, TICKET, _value, "");
        emit TicketPurchase(msg.sender, _value, keyCost, false);
    }

    function purchaseWithMice(uint256 _value) external isInPresale  {
        MouseContract.safeTransferFrom(msg.sender, address(this), 0, _value, "");
    }

    function totalTicketSupply() public view returns(uint256)  {
        return totalTicketsMinted + totalTicketsMintedAtPresale;
    }

    /* Returns price to mint in DAI */
    function getPrice(uint256 amountMinted) public view returns(uint256) {
        return ((CHEEZ_PRICE + (INCREMENT_PRICE_BY * amountMinted)) * 10 ** 18) / 10000;
    }


    /**
     * @dev Mints tickets per each mouse sent
     */
    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) override public isInPresale returns (bytes4) {
        require(_msgSender() == address(MouseContract), "unauthorized");
        require(id == 0, "incorrect nft");
        require(value > 0, "invalid value");
        require(value <= maxMicePerTx, "max per tx exceeded");
        require(value + totalTicketsMintedAtPresale <= maxTicketsFromPresale, "max tickets exceeded");

        uint amountToMint = ticketsPerMouse * value;
        totalTicketsMintedAtPresale += amountToMint;
        _mint(from, 0, amountToMint * 10 ** 9, "");

        MouseContract.safeTransferFrom(address(this), treasury, 0, value, "");

        emit TicketPurchase(from, value, 0, true);
        
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(address operator, address from, uint256[] memory ids, uint256[] memory values, bytes calldata data) override pure public returns(bytes4) {
        require(false == true, "batch not supported");
    }

    function supportsInterface(bytes4 interfaceID) override(ERC1155, IERC165) public pure returns (bool) {
        return true;
    }

    /* Used to update treasury address */
    function updateTreasuryAddress(address _treasury) public onlyOwner {
        treasury = _treasury;
    }
}