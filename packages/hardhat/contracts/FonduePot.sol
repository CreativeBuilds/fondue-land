pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Cheez Jackpot
contract FonduePot is Ownable {

  // Deposit event, includes roundId, address, amount
  event Deposit(uint256 roundId, address player, uint256 amount);

  // Winner event, includes roundId, address, amount, fee
  event Winner(uint256 roundId, address player, uint256 amount, uint256 fee);

  uint public max_players = 10;
  uint public min_blocks_to_close = 20; // ensures 20 blocks between depositing and winner getting picked
  bool public canDeposit = false;
  IERC20 public CHEEZ = IERC20(0xBbD83eF0c9D347C85e60F1b5D2c58796dBE1bA0d);
  address public feeCollector;

  // min deposit 1 with 9 digits with _ every 3 digits
  uint public min_deposit = 10_000_000; // 0.01 CHEEZ
  uint public potFee = 500; // 5% fee

  // Entry struct, address, amount
  struct Entry {
    address player;
    uint amount;
  }

  // Round struct, roundId, entries, winner, fee
  struct Round {
    uint roundId;
    uint totalFunds;
    address winner;
    uint minRange;
    uint maxRange;
    uint winningNumber;
  }

  mapping(uint => Entry) public entries;
  uint public totalEntries;
  uint public totalFunds;
  uint public roundId;
  uint public lastDepositableBlock;

  Round[] public rounds;

  constructor() {
    feeCollector = msg.sender;
  }

  function blocksTillClose() public view returns (uint) {
    require(lastDepositableBlock > 0, "Round is not set to close");
    if(block.number > lastDepositableBlock) return 0;
    return (lastDepositableBlock - block.number);
  }

  // function to deposit cheez, pays out last round if there is one, starts countdown if more than 2 players
  function deposit(uint amount) public {
    // ensure amount above min deposit
    require(canDeposit, "Can't deposit yet");
    require(amount >= min_deposit, "Not enough CHEEZ");

    // if past lastDepositableBlock, closePreviousRound
    if (block.number > lastDepositableBlock && lastDepositableBlock > 0) {
      closePreviousRound();
    }

    CHEEZ.transferFrom(msg.sender, address(this), amount);

    uint maxEntries = totalEntries;
    
    // if no maxEntries, add to currentRound else
    // Loop through existing entries, increment amount if player already exists, add new entry if not
    if(maxEntries == 0) {
        // First Player;
        entries[0] = (Entry({player: msg.sender, amount: amount}));
        totalEntries = 1;
        totalFunds = amount;
    } else {
      for (uint i = 0; i < maxEntries; i++) {
        if (entries[i].player == msg.sender) {
          // Player already exists, increment amount
          entries[i].amount += amount;
          totalFunds += amount;
          if (totalEntries >= 2) {
            // start countdown with lastDepositableBlock
            lastDepositableBlock = block.number + min_blocks_to_close;
          }
          break;
        }

        // New player
        if (i == maxEntries - 1) {
          require(maxEntries < max_players, "Too many players");
          entries[maxEntries] = (Entry({player: msg.sender, amount: amount}));
          totalEntries = maxEntries + 1;
          totalFunds += amount;
          if (totalEntries >= 2) {
            // start countdown with lastDepositableBlock
            lastDepositableBlock = block.number + min_blocks_to_close;
          }
        }
      } 
    }

    

    emit Deposit(roundId, msg.sender, amount);
  }
  
  // function to close previous round, if there is one
  function closePreviousRound() public returns(address winner) {
    require(block.number > lastDepositableBlock, "Not time to close round");
    require(roundId > 0 && totalEntries > 1, "Cant close");
    winner = address(0);
        // determine each users percentage of total funds, before multiply by 10000 to get as percentage

    // pick number between 0 and 10000
    uint random = getRand(10000);
    uint sum = 0;

    // loop through each player and add their percentage to sum while there is no winner
    // if sum is less than random, winnerIndex is that player, continue from loop
    uint winnerIndex = 0;
    uint winMin;
    uint winMax;
    while(winner == address(0)) {
      // break if winnerIndex exceeds maxEntries
      require(winnerIndex < max_players, "Winner not found");
      uint percent_chance = (entries[winnerIndex].amount * 10000) / totalFunds;
      if (sum < random && sum + percent_chance >= random) {
        winner = entries[winnerIndex].player;
        winMin = sum;
        winMax = sum + percent_chance;
      }
      winnerIndex++;
      sum += percent_chance;
    }


    // transfer fee to feeCollector
    CHEEZ.transfer(feeCollector, totalFunds * potFee / 10000);
    // transfer funds to winner
    CHEEZ.transfer(winner, totalFunds * (10000 - potFee) / 10000);
    
    Round memory _round = Round({roundId: roundId, totalFunds: totalFunds, winner: winner, winningNumber: random, minRange:winMin, maxRange: winMax });
    rounds.push(_round);

    // loop through entries and delete each
    for (uint i = 0; i < totalEntries; i++) {
      delete entries[i];
    }

    // reset currentRound
    roundId++;
    totalEntries = 0;
    totalFunds = 0;
    lastDepositableBlock = 0;

    emit Winner(roundId, winner, totalFunds * (10000 - potFee) / 10000, totalFunds * potFee / 10000);
    require(winner != address(0), "No winner");
    return winner;
  }

  function getLastRound() public view returns(Round memory) {
    require(rounds.length > 0, "No rounds");
    return rounds[rounds.length - 1];
  }

  function getWinChance(uint index) public view returns (uint percentage) {
    require(index <= totalEntries - 1, "Invalid index");
    require(totalFunds > 0, "No funds");
    require(entries[index].amount > 0, "entry has no funds");
    percentage = (entries[index].amount * 10000) / totalFunds;
    return percentage;
  }

  function getEntries() public view returns (uint) {
    return totalEntries;
  }

  function getRand(uint modulus) public view returns (uint) {
      return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % modulus; // use locally generated randomness
      // return uint(vrf()) % modulus; // TODO use on mainnet
  }
  
  // function to initialize the pot, only called by the owner
  function initPot() public onlyOwner {
    canDeposit = true; 
    roundId = 1;
    totalFunds = 0;
  }

  function setFeeCollector(address _feeCollector) public onlyOwner {
    feeCollector = _feeCollector;
  }

  function setMaxPlayers(uint _maxPlayers) public onlyOwner {
    max_players = _maxPlayers;
  }

  // set min deposit
  function setMinDeposit(uint _minDeposit) public onlyOwner {
    min_deposit = _minDeposit;
  }

  function vrf() public view returns (bytes32 result) {
    uint[1] memory bn;
    bn[0] = block.number;
    assembly {
      let memPtr := mload(0x40)
      if iszero(staticcall(not(0), 0xff, bn, 0x20, memPtr, 0x20)) {
        invalid()
      }
      result := mload(memPtr)
    }
  }
}
