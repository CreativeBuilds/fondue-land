import { BigInt } from "@graphprotocol/graph-ts";
// import {Deposit, Winner} from "../generated/FonduePot/FonduePot";
import {TicketPurchase} from "../generated/FondueTickets/FondueTickets";
import {TakeThePot} from "../generated/TheFondueMicePot/TheFondueMicePot"; 
import {Purchase, TakeThePot as Deposit} from "../generated/schema";

export function handleTicketPurchase(event: TicketPurchase): void {
  let amount = event.params.value;
  let player = event.transaction.from;
  let purchase = new Purchase(event.transaction.hash.toHex() +"-"+ event.transaction.index.toString());
  purchase.createdAt = event.block.timestamp;
  purchase.amount = amount;
  purchase.cost = event.params.cost;
  purchase.purchaser = player;
  purchase.isPresale = false;
  purchase.save();
}

export function handleKeysDeposited(event: TakeThePot): void {
  let amount = event.params._amount;
  let player = event.transaction.from;
  let deposit = new Deposit(event.transaction.hash.toHex()+"-"+ event.transaction.index.toString());
  deposit.createdAt = event.block.timestamp;
  deposit.amount = amount;
  deposit.depositer = player;
  deposit.save();
}

// // function handleDeposit
// export function handleDeposit(event: Deposit): void {
//   let amount = event.params.amount;
//   let player = event.params.player;
//   let roundId = event.params.roundId;
//   let round = Round.load(roundId.toString());
//   let entry = Entry.load(roundId.toString() + "-" + player.toHexString());
//   let _player = Player.load(player.toHexString());

//   if(!_player) {
//     _player = new Player(player.toHexString());
//     _player.id = player.toHexString();
//     _player.entries = [];
//     _player.createdAt = event.block.timestamp;
//     _player.totalBet = amount;
//     _player.address = player;
//     _player.totalBet = new BigInt(0);
//     _player.totalWon = new BigInt(0);
//   }
  
//   let EntryID = roundId.toString() + "-" + player.toHexString();
  
//   if (!round) {
//     round = new Round(roundId.toString());
//     round.id = roundId.toString();
//     round.amount = amount;
//     round.entries = [];
//     round.createdAt = event.block.timestamp;
//   } else {
//     round.amount = round.amount.plus(amount);
//   }

//   if(!entry) {
//     entry = new Entry(roundId.toString() + "-" + player.toHexString());
//     entry.id = EntryID;
//     entry.sender = player.toHexString();
//     entry.amount = amount;
//     entry.createdAt = event.block.timestamp;
//     entry.won = false;
//     entry.round = roundId.toString();
//     let roundEntries = round.entries;
//     let playerEntries = _player.entries;
//     roundEntries.push(entry.id);
//     playerEntries.push(entry.id);
//     round.entries = roundEntries;
//     _player.entries = playerEntries;
//   } else {
//     entry.amount = entry.amount.plus(amount);
//   }


//   _player.totalBet = _player.totalBet.plus(amount);

//   entry.save();
//   round.save();
//   _player.save();

// }

// // function handleWinner
// export function handleWinner(event: Winner): void {
//   let round = Round.load(event.params.roundId.toString());
//   if(!round) {
//     // create new round
//     round = new Round(event.params.roundId.toString());
//     round.id = event.params.roundId.toString();
//     round.amount = event.params.amount;
//     round.createdAt = event.block.timestamp;
//     round.entries = [];
//     round.save()
//   }
//   let entry = Entry.load(event.params.roundId.toString() + "-" + event.params.player.toHexString());
//   let player = Player.load(event.params.player.toHexString());

//   round.winner = entry.id;
//   entry.won = true;
//   player.totalWon = player.totalWon.plus(event.params.amount);
  
//   round.save();
//   entry.save();
//   player.save();
// }