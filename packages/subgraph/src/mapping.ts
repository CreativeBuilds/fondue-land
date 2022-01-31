import { BigInt } from "@graphprotocol/graph-ts";
import {Deposit, Winner} from "../generated/FonduePot/FonduePot";
import {Round, Entry, Player} from "../generated/schema";

// function handleDeposit
export function handleDeposit(event: Deposit): void {
  let amount = event.params.amount;
  let player = event.params.player;
  let roundId = event.params.roundId;
  let round = Round.load(roundId.toString());
  let entry = Entry.load(roundId.toString() + "-" + player.toHexString());
  let _player = Player.load(player.toHexString());
  
  if(!entry) {
    entry = new Entry(roundId.toString() + "-" + player.toHexString());
    entry.id = roundId.toString() + "-" + player.toHexString();
    entry.sender = player.toHexString();
    entry.amount = amount;
    entry.createdAt = event.block.timestamp;
    entry.won = false;
  } else {
    entry.amount = entry.amount.plus(amount);
  }

  if (round === null) {
    round = new Round(roundId.toString());
    round.id = roundId.toString();
    round.amount = amount;
    round.createdAt = event.block.timestamp;
    round.entries = [entry.id]
  } else {
    round.amount = round.amount.plus(amount);
    if(!round.entries.includes(entry.id)) round.entries.push(entry.id);
  }
  if(!_player) {
    _player = new Player(player.toHexString());
    _player.id = player.toHexString();
    _player.entries = [entry.id];
    _player.createdAt = event.block.timestamp;
    _player.totalBet = amount;
    _player.address = player;
    _player.totalBet = amount;
    _player.totalWon = new BigInt(0);
  } else {
    if(!_player.entries.includes(entry.id)) {
      _player.entries.push(entry.id);
    }
    _player.totalBet = _player.totalBet.plus(amount);
  }
  _player.save();
  entry.round = round.id;
  entry.save();
  round.save();
}

// function handleWinner
export function handleWinner(event: Winner): void {
  let round = Round.load(event.params.roundId.toString());
  let entry = Entry.load(event.params.roundId.toString() + "-" + event.params.player.toHexString());
  let player = Player.load(event.params.player.toHexString());

  round.winner = entry.id;
  entry.won = true;
  player.totalWon = player.totalWon.plus(round.amount);
  
  round.save();
  entry.save();
  player.save();
}