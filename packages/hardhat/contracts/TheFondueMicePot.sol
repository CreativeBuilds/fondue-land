pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./token/ERC20Rewards.sol";

contract TheFondueMicePot is ERC20Rewards, ERC1155Receiver {
    
    IERC1155 FondueKeys;
    address public first_place;
    address public second_place;
    uint256 public total_keys_entered = 0;
    uint256 public blocks_per_key = 150;
    uint256 public max_block_timer = blocks_per_key * 500; // max 500 keys worth deposited
    uint256 public timer_end_date = 0;

    event TakeThePot (address from, uint256 _amount, uint256 _endDate);
    
    /* call setRewardsToken after deploying */
    constructor( IERC1155 _fondueKeys) ERC20Rewards(
        "fondue",
        "fondue",
        9
    ) {
        FondueKeys = _fondueKeys;
    }

    function enterKeys(uint256 _amount) external returns (uint256 keys_deposited){
        require(msg.sender != first_place, "you're in possesion of the pot already");
        uint256 max = maxDepositable() * 10 ** 9;
        uint256 maxKeysSendable =  max > _amount ? _amount : max;
        uint256 _amountToSend = (maxKeysSendable > _amount) ? _amount : maxKeysSendable;
            
        FondueKeys.safeTransferFrom(msg.sender, address(this), 0, _amountToSend, "");
        _burn(address(this), _amountToSend);

        second_place = first_place;
        first_place = msg.sender;

        if(timer_end_date == 0) timer_end_date = block.number + (_amountToSend / 10 ** 9 * blocks_per_key);
        else timer_end_date = timer_end_date + ((_amountToSend / 10 ** 9) * blocks_per_key);

        emit TakeThePot(msg.sender, _amountToSend / 10 ** 9, timer_end_date);
        
        keys_deposited = _amountToSend;
        return keys_deposited;
    }

    function maxDepositable() view public returns(uint256 maxKeysToSend) {
        if(timer_end_date == 0) {
            maxKeysToSend = 100;
            return maxKeysToSend;
        }
        uint256 blocksTillEnd = block.number < timer_end_date ? timer_end_date - block.number : 0;
        maxKeysToSend = (max_block_timer - blocksTillEnd) / blocks_per_key;
    }

    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) override external returns(bytes4) {
        require(msg.sender == address(FondueKeys), "unauthorized");
        require(id == 0, "incorrect nft");
        require(value / 10 ** 9 > 0, "invalid value");
        require(value <= maxDepositable() * 10 ** 9, "exceeds maximum depositable keys");
        require(timer_end_date == 0 || block.number < timer_end_date, "round has ended");

        _mint(from, value);
        
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(address operator, address from, uint256[] memory ids, uint256[] memory values, bytes calldata data) override external returns(bytes4) {}

    /**
     * @dev used if ever harmony block times significantly change 
     */
    function setBlocks(uint256 _blocks_per_key, uint256 _total_keys) auth public {
        blocks_per_key = _blocks_per_key;
        max_block_timer = blocks_per_key * _total_keys;
    }
}