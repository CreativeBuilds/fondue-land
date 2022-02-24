pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// Todo implement ERC20 rewards
import "./ERC20Rewards.sol";

contract TheFondueMicePot is ERC20Rewards, IERC1155Receiver {
    
    IERC1155 FondueKeys = IERC1155(0x65324732592b50fe72c86cE4041F2AeFcd55DA84);
    address first_place;
    address second_place;
    uint256 total_keys_entered = 0;
    uint256 blocks_per_key = 150;
    uint256 max_block_timer = blocks_per_key * 200; // max 200 keys worth deposited
    uint256 timer_end_date = 0;

    event KeysDeposited (address from, uint256 _amount, uint256 _endDate);
    
    constructor(address rewardsToken_) ERC20Rewards(
        "fondue",
        "fondue",
        9
    ) {
        setRewardsToken(rewardsToken_);
    }

    function enterKeys(uint256 _amount) external returns (uint256 keys_deposited){
        uint256 maxKeysToSend =  maxDepositable(_amount);
        uint256 _amountToSend = (maxKeysToSend > _amount) ? _amount : maxKeysToSend;
            
        FondueKeys.safeTransferFrom(msg.sender, address(this), 0, _amountToSend * 10 ** 9, "");
        
        return (_amount > maxKeysToSend) ? _amount : maxKeysToSend;
    }

    function maxDepositable() view returns(uint256 maxKeysToSend) {
        uint256 blocksTillEnd = block.number < timer_end_date ? timer_end_date - block.number : 0;
        maxKeysToSend = (max_block_timer - blocksTillEnd) / blocks_per_key;
    }

    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes data) {
        require(_msgSender() == address(FondueKeys), "unauthorized");
        require(id == 0, "incorrect nft");
        require(value > 0, "invalid value");
        require(value <= maxDepositable() * 10 ** 9, "exceeds maximum depositable keys");
        require(timer_end_date == 0 || block.number < timer_end_date, "round has ended");

        _mint(from, value);


        if(timer_end_date == 0) timer_end_date = block.number + (value / 10 ** 9 * blocks_per_key);
        else timer_end_date = timer_end_date + ((value / 10 ** 9) * blocks_per_key);

        emit KeysDeposited(from, value / 10 ** 9, timer_end_date);
    }

    /**
     * @dev used if ever harmony block times significantly change 
     */
    function setBlocks(uint256 _blocks_per_key, uint256 _total_keys) auth {
        blocks_per_key = _blocks_per_key;
        max_block_timer = blocks_per_key * _total_keys;
    }
}