import { useContractReader } from "eth-hooks";
import { useEffect, useState } from "react";
import { switchMap, timer } from "rxjs";

export function useGameInfo(readContracts, userSigner, maxHistoryLength = 10) {
  const totalFunds = useContractReader(readContracts, "FonduePot", "totalFunds");
  const roundId = useContractReader(readContracts, "FonduePot", "roundId");
  const endDate = useContractReader(readContracts, "FonduePot", "endDate");
  const [roundHistory, setRoundHistory] = useState([]);
  const currentRound = roundId ? Number(roundId.toString()) : 0;

  // when roundId updates, check latest round in history, fetch needed rounds and set history
  useEffect(() => {
    // Gets Latest Rounds with where winner has been set
    timer(0, 3000)
      .pipe(
        switchMap(() => {
          return fetch("http://localhost:8000/subgraphs/name/fondue/pot", {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
            },
            body: '{"query":"{\\n  _meta {\\n    block { number }\\n  }\\n  \\n  rounds (first: 10, orderBy: createdAt, where: {\\n    winner_not: null\\n  } subgraphError: deny) {\\n      \\n      amount\\n    createdAt\\n    winner {\\n      id\\n    }\\n    \\tentries {\\n        amount\\n        id\\n        round {\\n          id\\n        }\\n      }\\n    }\\n}","variables":null,"operationName":null}',
            method: "POST",
            mode: "cors",
          })
            .then(x => x.json())
            .then(x => x.data.rounds);
        }),
      )
      .subscribe(rounds => {
        console.log(rounds);
      });

    // const highestIdRound = roundHistory.length ? roundHistory[roundHistory.length - 1].roundId : 0;
    // const amountOfRoundsToFetch = currentRound - highestIdRound;
    // if (amountOfRoundsToFetch > 0) {
    //   const newRounds = [];
    //   for (let i = amountOfRoundsToFetch - 10; i < amountOfRoundsToFetch; i++) {
    //     newRounds.push(
    //       readContracts.FonduePot.rounds(i).catch(err => {
    //         console.error(err);
    //         return err.message;
    //       })
    //     );
    //   }
    //   Promise.all(newRounds).then(rounds => {
    //     const newHistory = [...roundHistory, ...rounds].sort((a, b) => b.roundId - a.roundId);
    //     setRoundHistory(newHistory.slice(-maxHistoryLength));
    //   });
    // }
  }, [currentRound, roundHistory, maxHistoryLength, readContracts, userSigner]);
  return {
    endDate,
    totalFunds,
    roundId,
    // format all variables in history
    roundHistory: roundHistory
      .filter(x => !!x && typeof x !== "string")
      .map(i => {
        return {
          maxRange: i.maxRange.toString(),
          minRange: i.minRange.toString(),
          potValue: i.potValue.toString(),
          winner: i.winner,
          winningNumber: i.winningNumber.toString(),
          roundId: i.roundId.toString(),
        };
      }),
  };
}
