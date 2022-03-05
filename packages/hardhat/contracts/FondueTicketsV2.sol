pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "./TheFondueMicePot.sol";

contract FondueTicketsV2 is ERC1155, ERC1155Supply, Ownable {
    struct OGMinter {
        address minter; // Address of who minted
        uint256 minted; // How many keys they minted
    }

    IERC20 public DAI = IERC20(0xEf977d2f931C1978Db5F6747666fa1eACB0d0339);
    IERC20 public CHEEZ = IERC20(0xBbD83eF0c9D347C85e60F1b5D2c58796dBE1bA0d);

    address public treasury = address(0xD9d54CFFe5BbBb0633AEc3739488dfD0a00BeF5E);
    address public _dev;
    TheFondueMicePot public FONDUE;
    IUniswapV2Router02 public router = IUniswapV2Router02(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506);
    IUniswapV2Factory public factory;

    uint256 KEYS = 0;
    uint256 BASE_COST_IN_DAI = 1 * 10 ** 18;
    uint256 INCREASE_PER_KEY = (3 * 10 ** 18) / 10000; // Increase by $3 for every 10,000 keys minted ($1 per 3,333 keys);
    uint256 MAX_PURCHASEABLE_KEYS = 100;

    uint256 public DEV_PERCENT = 777; // out of 10000
    uint256 public FONDUE_BUYBACK_PERCENT = 2112; // out of 10000

    event TicketPurchase(address indexed buyer, uint256 amount, uint256 cost);

    constructor(OGMinter[] memory _ogMinters) ERC1155("https://fondue.land/api/token/${id}.json") {
        for (uint256 i = 0; i < _ogMinters.length; i++) {
            _mint(_ogMinters[i].minter, KEYS, _ogMinters[i].minted * 10 ** 9, "");
        }
        _dev = msg.sender;
        factory = IUniswapV2Factory(router.factory());
    }

    function SetDev(address newDevAddress) public onlyOwner {
        require(newDevAddress != address(0x0));
        _dev = newDevAddress;
    }

    function SetMousePot(TheFondueMicePot newMicePot) public onlyOwner {
        FONDUE = newMicePot;
    }

    function SetMaxPurchaseableKeys(uint256 newMaxPurchaseableKeys) public onlyOwner {
        require(newMaxPurchaseableKeys > 0);
        MAX_PURCHASEABLE_KEYS = newMaxPurchaseableKeys;
    }

    function PurchaseWithDAI(uint256 amountOfKeys) public {
        uint256 cost = GetCost(amountOfKeys);
        require(amountOfKeys <= MAX_PURCHASEABLE_KEYS, "Amount of keys is greater than max purchaseable keys");

        HandleDaiTransfer(cost);
        emit TicketPurchase(msg.sender, amountOfKeys, cost);
    }

    function HandleDaiTransfer(uint256 cost) internal {
        // transfer 50% of dai from msg.sender to TheMicePot
        uint256 halfDai = cost / 2;
        DAI.transferFrom(msg.sender, address(FONDUE), halfDai); // will be distributed to FONDUE holders
        // transfer 7.77% of dai from msg.sender to dev
        DAI.transferFrom(msg.sender, address(this), halfDai);

        uint256 devDai = (cost * 777 ) / 10000;
        DAI.transfer(_dev, devDai);

        address FondueLP = factory.getPair(address(FONDUE), address(DAI));
        uint256 leftOverFunds = DAI.balanceOf(address(this));

        DAI.approve(address(router), leftOverFunds);
        if(FONDUE_BUYBACK_PERCENT > 0 && FondueLP != address(0)) {
            // transfer 21.1% of dai from msg.sender to fondue
            uint256 fondueDai = (cost * FONDUE_BUYBACK_PERCENT) / 10000;
            leftOverFunds -= fondueDai;
            // approve the router to spend fondueDai
            // use half of fondueDAI to buy back the fondue
            uint256 halfFondueDai = fondueDai / 2;
            address[] memory path = new address[](2);
            path[0] = address(DAI);
            path[1] = address(FONDUE);
            router.swapExactTokensForTokens(halfFondueDai, 0, path, address(treasury), block.number);

            uint256 currentBalance = FONDUE.balanceOf(address(this));
            // approve the FONDUE funds
            FONDUE.approve(address(router), currentBalance);

            // form LP with the remaining funds
            router.addLiquidity(address(FONDUE), address(DAI), currentBalance, halfFondueDai, 0, halfFondueDai, address(treasury), block.number);
        }

        address CheezLP = factory.getPair(address(FONDUE), address(CHEEZ));
        
        leftOverFunds = DAI.balanceOf(address(this));

        /**
         * @dev Buys back cheez with the remaining funds
         *      
         */
        address[] memory path = new address[](2);
        path[0] = address(DAI);
        path[1] = address(CHEEZ);
        router.swapExactTokensForTokens(leftOverFunds, 0, path, address(treasury), block.number);
    }
    
    function GetCost(uint256 amountOfKeys) public view returns (uint256 cost) {
        uint256 NextKey = totalSupply(KEYS) + 1;
        uint256 costForNextKey = CalculateKeyPriceAt(NextKey);
        uint256 costForLastKey = CalculateKeyPriceAt(NextKey + (amountOfKeys - 1));
        uint256 averageCost = (costForNextKey + costForLastKey) / 2;
        return averageCost * amountOfKeys;
    }

    function TotalKeys() public view returns (uint256 total) {
        return totalSupply(KEYS) / 10 ** 9;
    }

    function CalculateKeyPriceAt(uint256 index) internal view returns (uint256 amount) {
        require(index > 0, "invalid key index");
        return BASE_COST_IN_DAI + (index - 1) * INCREASE_PER_KEY;
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) override(ERC1155, ERC1155Supply) internal {}
}