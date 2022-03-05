pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DummyTickets is ERC1155, ERC1155Supply, Ownable {
    struct OGMinter {
        address minter; // Address of who minted
        uint256 minted; // How many keys they minted
    }

    uint256 KEYS = 0;
    uint256 MAX_PURCHASEABLE_KEYS = 1000;

    uint256 PREMINTED;

    uint256 BASE_COST_IN_DAI = 1 * 10 ** 18;
    uint256 INCREASE_PER_KEY = (3 * 10 ** 18) / 10000; // Increase by $3 for every 10,000 keys minted ($1 per 3,333 keys);

    event TicketPurchase(address indexed buyer, uint256 amount, uint256 cost);


    constructor(OGMinter[] memory _ogMinters) ERC1155("https://fondue.land/api/token/${id}.json") {
        for (uint256 i = 0; i < _ogMinters.length; i++) {
            PREMINTED += _ogMinters[i].minted;
            _mint(_ogMinters[i].minter, KEYS, _ogMinters[i].minted * 10 ** 9, "");
            emit TicketPurchase(_ogMinters[i].minter, _ogMinters[i].minted, _ogMinters[i].minted * 10 ** 18);
        }
    }

    function PurchaseWithDAI(uint256 amountOfKeys) public {
        require(amountOfKeys <= MAX_PURCHASEABLE_KEYS, "Amount of keys is greater than max purchaseable keys");

        emit TicketPurchase(msg.sender, amountOfKeys, GetCost(amountOfKeys));
        _mint(msg.sender, KEYS, amountOfKeys * 10 ** 9, "");

    }

    function GetCost(uint256 amountOfKeys) public view returns (uint256 cost) {
        uint256 NextKey = (totalSupply(KEYS) / 10 ** 9) - PREMINTED;
        uint256 costForNextKey = CalculateKeyPriceAt(NextKey);
        uint256 costForLastKey = CalculateKeyPriceAt(NextKey + (amountOfKeys - 1));
        uint256 averageCost = (costForNextKey + costForLastKey) / 2;
        return averageCost * amountOfKeys;
    }

    function CalculateKeyPriceAt(uint256 index) internal view returns (uint256 amount) {
        if (index == 0) {
            return BASE_COST_IN_DAI;
        }
        return BASE_COST_IN_DAI + ((index - 1) * INCREASE_PER_KEY);
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) override(ERC1155, ERC1155Supply) internal {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}