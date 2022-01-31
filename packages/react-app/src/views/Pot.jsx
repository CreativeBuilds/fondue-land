import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContractLoader, useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import styled from "styled-components";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useRef } from "react";
Chart.register(ArcElement, Tooltip);

const Donut = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 38vw;
  height: 45vw;
  max-height: 45vh;
  max-width: 38vh;
  margin: auto;
  h1 {
    font-size: 3rem;
    margin: 0;
  }
  h2 {
    font-size: 2rem;
    margin: 0;
  }
  & > canvas {
    position: absolute;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  position: relative;

  width: 38vw;
  max-width: 45vh;
  margin: auto;
  margin-top: 60px;

  & > div.buttons {
    position: absolute;
    right: -5px;
    top: -2.75em;
  }

  button {
    width: auto;
    display: inline;
    flex: 0;
    padding: 0.25em 1.25em;
    color: #202020;
    background-color: #ffd100;
    border: unset;
    border-radius: 5px;
    margin: 0em 0.25em;

    &:hover,
    &:active {
      cursor: pointer;
      background-color: #ffd100;
    }

    &:disabled {
      background-color: #ffd10022;
      &:hover {
        cursor: unset;
      }
    }
  }

  & > button {
    margin: 0;
    margin-top: 10px;
    border-radius: 15px;
    font-size: 1.3rem;
  }

  & > h2 {
    text-align: left;
    font-size: 1.4rem;
    position: absolute;
    top: -40px;
    &:nth-child(2) {
      right: 0.5em;
      font-size: 1.2rem;
      top: 0.5em;
      color: #202020;
      &:hover {
        cursor: default;
      }
    }
  }

  & > input {
    padding: 0.25em 0.5em;
    color: #202020;
    background: #ffd100;
    border: unset;
    border-radius: 15px;
    font-size: 1.4rem;
    &::placeholder {
      color: #202020;
    }
  }
`;

const PotWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  height: 100%;
  padding-top:7.5vh;
  & > div:nth-child(2) {
      margin-top: 3vh;
    }

    & > div:nth-child(3) {
      display: flex;
      flex-direction: column
    }

  /* when media is larger than mobile increase columns to five */
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    
    & > div:nth-child(1) {
      grid-column: 2 / 5;,
    }
    & > div:nth-child(2) {
      grid-column:  5 / 7; 
      grid-row: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin-top: 0;
      min-width:min-content;
    }
    & > div:nth-child(3) {
      grid-row: 2;
      grid-column: 2 / 7;
    }
  }

  table {
    /* webkit fill content */
    width: -webkit-fill-available;
    margin: 3rem;
    &.rounds-table{
      margin-top:0;
    }
    min-width: 30ch;
    tr {
      position: relative;
      margin: 1em;
      * {
        font-size:1.4rem;
      }
      &.players-table {
        th, td {
          text-align:left;
          float: left;
        }
        th:nth-child(2), td:nth-child(2) {
          position:absolute;
          text-align:left;
          float:left;
          right:0;
        }

        th:nth-child(2){
          position: inherit;
          text-align:center;
          float:unset;
        }
      }
    }
  }

  /* when screen width is that of a large monitor */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(13, 1fr);
    & > div:nth-child(1) {
      grid-column: 5 / 10;
    }
    & > div:nth-child(2) {
      grid-column:  10 / 13; 
      grid-row: 1;
    }
    & > div:nth-child(3) {
      grid-row: 1;
      grid-column: 1 / 5;
      display: flex;
      justify-content: center;
    }
  }
`;

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function Pot({ address, readContracts, writeContracts, info }) {
  if (!readContracts?.FonduePot) return null;
  const {
    totalFunds,
    roundId,
    roundHistory,
    players,
    totalEntries,
    FonduePotAddress,
    myCheezBalance,
    myCheezAllowance,
    endDate,
  } = info;
  const [toDeposit, setToDeposit] = React.useState("");
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [locked, setLocked] = React.useState(false);

  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract

  const formattedFunds = totalFunds ? Number(totalFunds.div(Math.pow(10, 5)).toString()) / 10000 : 0;
  const formattedCheezBalance = myCheezBalance ? Number(myCheezBalance.div(Math.pow(10, 5)).toString()) / 10000 : 0;
  const formattedCheezAllowance = myCheezAllowance
    ? Number(myCheezAllowance.div(Math.pow(10, 5)).toString()) / 10000
    : 0;

  const { labels, data, colors } = GenerateLabelsAndData(players, address, toDeposit);

  useEffect(() => {
    if (!endDate || isNaN(endDate)) return;
    let i = setInterval(() => {
      if (Number(endDate?.toString()) <= 0) setTimeLeft(0);
      setTimeLeft(Number(endDate?.toString()) - Date.now() / 1000);
    }, 100);
    return () => clearInterval(i);
  }, [endDate]);

  return (
    <PotWrapper>
      <div>
        <h1 style={{ marginBottom: "1vh" }}>the fondue pot 🧀</h1>
        <h2 style={{ marginBottom: "5vh" }}>round #{(roundId)?.toString()}</h2>
        {/* Create a circle  with a second smaller circle inside of it with the color of the background */}
        <Donut>
          <Doughnut
            options={{
              cutout: "80%",
            }}
            data={{
              labels: labels,
              datasets: [
                {
                  label: "bet",
                  data: data,
                  backgroundColor: colors,
                  borderColor: ["#202020"],
                  borderRadius: "5",
                  borderWidth: "1",
                },
              ],
            }}
          />
          <h1>{formattedFunds} 🧀</h1>
          <h2>
            {timeLeft < 0
              ? "waiting..."
              : (timeLeft < 10 ? Number(timeLeft).toPrecision(2) : Math.floor(timeLeft)) + "s"}
          </h2>
        </Donut>
        <InputWrapper>
          <h2>deposit </h2>
          <h2>bal: {formattedCheezBalance} 🧀</h2>
          <div className="buttons">
            <button onClick={() => setToDeposit(String(Number(toDeposit) / 2))}>0.5x</button>
            <button onClick={() => setToDeposit(formattedCheezBalance)}>MAX</button>
            <button onClick={() => setToDeposit(String(Number(toDeposit) * 2))}>2x</button>
          </div>
          <input placeholder="0.0" value={toDeposit} onChange={e => setToDeposit(e.target.value)} />
          {String(toDeposit).length > 0 && Number(toDeposit) > 0 && address ? (
            Number(formattedCheezAllowance) <= Number(toDeposit) ? (
              <button onClick={async () => writeContracts.CHEEZ.approve(FonduePotAddress, ethers.constants.MaxInt256)}>
                approve
              </button>
            ) : (
              <button
                disabled={locked}
                onClick={async () =>
                  locked
                    ? null
                    : writeContracts.FonduePot.deposit(
                        ethers.BigNumber.from(Math.floor(Number(toDeposit) * Math.pow(10, 9))),
                        {
                          gasLimit: 1000000,
                        },
                      ).then(async tx => {
                        await tx.wait(1);
                        setToDeposit("");
                        setLocked(false);
                      })
                }
              >
                deposit
              </button>
            )
          ) : Number(formattedCheezAllowance) == 0 ? (
            <button disabled>approve</button>
          ) : (
            <button disabled>deposit</button>
          )}
        </InputWrapper>
        <i>5% house fee is applied to pot winnings</i>
        <br />
        <i>(MIN / MAX) 0.1 🧀 / 100 🧀</i>
      </div>
      <div>
        {/* Create player table */}
        <table className="players-table">
          <thead>
            <tr>
              <th>player</th>
              <th>bet</th>
            </tr>
          </thead>
          <tbody>
            {players
              .sort((a, b) => b.amount - a.amount)
              .map((entry, index) => (
                <tr key={index}>
                  <td>{labels[index]}</td>
                  <td>{(entry.amount / 10 ** 9).toFixed(4)} 🧀</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2 style={{ float: "left", textAlign: "left", marginLeft: "3rem", marginTop: "3rem" }}>Last 10 Rounds</h2>
        <table className="rounds-table">
          <thead>
            <tr>
              <th>round</th>
              <th>winner</th>
              <th>amount</th>
              <th>chance</th>
            </tr>
          </thead>
          <tbody>
            {roundHistory
              .sort((a, b) => b.roundId - a.roundId)
              .map((round, index) => (
                <tr key={round.roundId}>
                  <td>{round.roundId}</td>
                  <td>{round.winner.slice(0, 5) + "..." + round.winner?.slice(round.winner.length - 3)}</td>
                  <td>{(Number(round.potValue) / 10 ** 9).toFixed(2)} 🧀</td>
                  <td>{((Number(round.maxRange) - Number(round.minRange)) / 100).toFixed(2)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </PotWrapper>
  );

  function GenerateLabelsAndData(entries, address, toDeposit) {
    // format address as 0x098...Fcb - 🧀
    const FormattedLabels = entries.map(entry => {
      if (!entry.player) return "err 🧀";
      return entry.player?.slice(0, 5) + "..." + entry.player?.slice(entry.player.length - 3);
    });
    let added;
    // generate colors as ffd100 for everyone else and ff9900 for address
    const colors = entries.map(entry => {
      return entry.player === address ? "#ff9900" : "#ffd100";
    });
    // get bets as data
    const data = entries.map(player => {
      const toAdd = player.player?.toLowerCase() === address?.toLowerCase() && toDeposit ? Number(toDeposit) : 0;
      // if toDeposit and address are the same, add to data
      if (toAdd != 0) added = true;
      return Number(player.amount.toString()) / 10 ** 9 + toAdd;
    });

    return {
      labels: !added ? [...FormattedLabels, "YOU"] : FormattedLabels,
      data: !added ? [...data, toDeposit] : data,
      colors: !added ? colors.concat("#ff9900") : colors,
    };
  }
}

export default Pot;
