import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import detectEthereumProvider from "@metamask/detect-provider";
import useProvider from "./helpers/useProvider";
import { PixelBox } from "./PixelBox/PixelBox";
import logo from "./logo.png";
import { PixelButton } from "./PixelButton/PixelButton";
import { useContract } from "./helpers/useContract";
import { Contract, ethers, Signer } from "ethers";
import { useFondueTicketsV2 } from "./helpers/useFondueTicketsV2";
import { useFondueTickets } from "./helpers/useFondueTickets";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import moment from "moment";
const MAX_KEYS_PER_TX = 1000;

function App() {
  const [shouldLogin, setShouldLogin] = React.useState(true);

  const { accounts, signer, provider } = useProvider(shouldLogin);
  const [mice, setMice] = React.useState(0);
  useMemo(() => console.clear(), []);


  return (
    <div className="App">
      <Routes>
        
        <Route
          path="/presale-old"
          element={
            <Presale
              accounts={accounts}
              signer={signer ? signer : (provider as any)}
              setShouldLogin={setShouldLogin}
              mice={mice}
              UpdateMice={UpdateMice}
            />
          }
        />
        <Route
          path="/"
          element={
            <Dashboard
              accounts={accounts}
              mice={mice}
              UpdateMice={UpdateMice}
              setShouldLogin={setShouldLogin}
              signer={signer ? signer : (provider as any)}
            />
          }
        />
      </Routes>

      <NotificationContainer />
    </div>
  );

  function UpdateMice(mice: number) {
    console.log(mice);
    if (mice > MAX_KEYS_PER_TX) {
      setMice(MAX_KEYS_PER_TX);
    } else setMice(Number(mice));
  }
}

export default App;

function AppHeaderBar({
  signer,
  setShouldLogin,
  accounts,
  title
}: {
  signer: Signer;
  setShouldLogin: (shouldLogin: boolean) => void;
  accounts: string[];
  title?: string;
}) {
  if (!title) title = "fondue.land";
  const ADDR = accounts[0]
    ? accounts[0].slice(0, 5) + "..." + accounts[0].slice(-3)
    : "";
  return (
    <div className="App-header-bar">
      <img
        style={{ marginLeft: "0.25em", marginRight: "0.75em" }}
        src={logo}
        className="App-logo"
        alt="logo"
      />
      <div id="title">{title}</div>
      <a href="https://docs.fondue.land/" target="_blank" style={{ marginLeft: 'auto', fontSize: '0.8ch', marginRight: '1ch' }}>DOCS</a>
      {!signer || accounts.length == 0 ? (
        <PixelButton
          style={{
            marginTop: "-0.5em",
            minWidth: "8ch",
            height: "2ch",
            marginRight: "1ch",
          }}
          onClick={() => setShouldLogin(true)}
        >
          CONNECT
        </PixelButton>
      ) : (
        <>
          <div
            className="App-header-bar-account"
          >
            {ADDR}
          </div>
          <PixelButton
            style={{
              marginLeft: "1em",
              marginTop: "-0.5em",
              minWidth: "11ch",
              height: "2ch",
              marginRight: "1ch",
            }}
            onClick={() => setShouldLogin(false)}
          >
            DISCONNECT
          </PixelButton>
        </>
      )}
    </div>
  );
}

function Presale({
  accounts,
  mice,
  UpdateMice,
  signer,
  setShouldLogin,
}: {
  accounts: string[];
  mice: number;
  UpdateMice: (mice: number) => void;
  signer: Signer;
  setShouldLogin: (shouldLogin: boolean) => void;
}) {
  const {
    price,
    minted,
    approvedFor,
    keyBalance,
    miceBalance,
    endDate,
    approveAllMice,
    purchaseWithMice,
  } = useFondueTickets(signer);

  useEffect(() => {
    if (!signer) UpdateMice(0);
  }, [signer]);

  return (
    <header className="App-header">
      <AppHeaderBar
        signer={signer}
        setShouldLogin={setShouldLogin}
        accounts={accounts}
        title="KEY PRESALE"
      />
      <div className="App-presale">
        <div className="App-fondue-info">
          <p>INFO BOARD</p>
          <PixelBox className="App-presale-info">
            <span style={{ fontSize: "0.75em" }}>
              welcome to the fondue.land presale
            </span>
            <br />
            <br />
            <span style={{ fontSize: "0.75em" }}>
              trade your cheesedao mice for{" "}
              <b style={{ fontSize: "1em", color: "white" }}>keys</b>. keys can
              later be entered for a chance to win a jackpot of mice
            </span>
            <br />
            <br />
            <span style={{ fontSize: "0.75em" }}>
              <b style={{ fontSize: "1em", color: "white" }}>CHEEZ</b> earned
              from mice will be used to buy mice off market to increase the{" "}
              <b style={{ fontSize: "1em", color: "white" }}>Fondue Pots</b>{" "}
              value
            </span>
            <br />
            <br />
            <span style={{ fontSize: "0.75em" }}>
              Keys can be minted post-presale, the profits of which will be
              redistributed pro-rata to all cheezers inside the{" "}
              <b style={{ fontSize: "1em", color: "white" }}>Fondue Pot</b>
            </span>
            <br />
            <br />
            <span style={{ fontSize: "0.75em" }}>
              For more info ask for{" "}
              <b style={{ fontSize: "1em", color: "white" }}>creative</b> on{" "}
              <a
                target="_blank"
                href="https://discord.gg/dU4usXbqP6"
                rel="noreferrer"
                style={{
                  color: "#FFE251",
                  fontWeight: "bold",
                  fontStyle: "unset",
                  fontSize: "1.1em",
                }}
              >
                discord
              </a>
            </span>
          </PixelBox>
        </div>
        <div className="App-presale-mint">
          <h3>KEY PRESALE</h3>
          <p>{endDate}</p>
          <PixelBox className="App-presale-dialog">
            <div className="App-presale-total-minted">
              <span>{minted} / 25000</span>
              <div
                style={{ width: `${(minted / 25000) * 100}%` }}
                className="progress"
              />
            </div>
            <h4 style={{ marginBottom: "1em", marginTop: "2ch" }}>MINT KEYS</h4>
            <span style={{ width: "calc(100% - 2.25ch)" }} className="input-wrapper">
              <div className="max-mice">
                {!!signer ? (
                  <PixelButton onClick={() => UpdateMice(miceBalance)}>
                    max
                  </PixelButton>
                ) : null}
              </div>
              {!!signer ? (
                <span className="mice-balance">{miceBalance}</span>
              ) : null}
              <span className={"input-label" + (signer ? " mice" : "")}>
                🐭
              </span>
              <input
                value={mice}
                placeholder="0 "
                className="mice-input"
                onChange={(e) => handleMiceInput(e)}
              />
              {mice === MAX_KEYS_PER_TX ? (
                <span className="input-message">(max tx limit)</span>
              ) : null}
            </span>
            <div className="arrow-box">
              <span>👇</span>
            </div>
            <span
              style={{ width: "calc(100% - 2.25ch)" }}
              className="input-wrapper"
            >
              {!!signer ? (
                <span className="mice-balance">{keyBalance}</span>
              ) : null}
              <span className={"input-label" + (signer ? " mice" : "")}>
                🔑
              </span>
              <input
                type="number"
                placeholder="0"
                className="mice-input"
                value={mice * 50}
                disabled={true}
              />
            </span>
            <br />
            <b style={{ fontSize: "0.5em" }}> 1 mouse = 50 keys</b>
            <br />
            {!signer ? (
              <PixelButton onClick={() => setShouldLogin(true)}>
                Connect Wallet
              </PixelButton>
            ) : approvedFor ? (
              <PixelButton
                disabled={mice === 0}
                onClick={() => {
                  // web3 signin
                  purchaseWithMice(mice).catch((err: any) =>
                    NotificationManager.error(err.data.message, null, 5000)
                  );
                }}
              >
                MINT{" "}
                <span
                  style={{
                    fontSize: "2em",
                    marginTop: "-0.4em",
                    marginLeft: "0.5em",
                  }}
                >
                  🗝
                </span>
                <span style={{ fontSize: "0.75em" }}>'s</span>
              </PixelButton>
            ) : (
              <PixelButton
                onClick={() => {
                  // web3 signin
                  approveAllMice()
                    .then()
                    .catch((err: any) =>
                      NotificationManager.error(err.data.message, null, 5000)
                    );
                }}
              >
                APPROVE
              </PixelButton>
            )}
          </PixelBox>
        </div>
      </div>
    </header>
  );

  function handleMiceInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const input = Math.floor(Number(e.target.value)) || 0;
    // trim leading zeros
    const mice = Number(input.toString().replace(/^0+/, ""));
    if (isNaN(Math.floor(Number(e.target.value)))) return;
    UpdateMice(mice);
  }
}

function Dashboard({
  accounts,
  mice,
  UpdateMice,
  setShouldLogin,
  signer,
}: {
  accounts: string[];
  mice: number;
  UpdateMice: (mice: number) => void;
  setShouldLogin: (bool: boolean) => void;
  signer: Signer;
}) {
  const {
    approvedFor,
    endDate,
    endDateFormated,
    events,
    fondueBalance,
    blocks,
    price,
    contract,
    daiContract,
    fondueContract,
    keysApprovedForFondue,
    maxDepositable,
    daiBalance,
    keyBalance,
    totalSupply,
    places,
    UpdateAll,
  } = useFondueTicketsV2(signer);

  const IS_FIRST_PLACE = useMemo(() => places[0]?.toLowerCase() === accounts[0]?.toLowerCase(), [places, accounts]);
  return (
    <header className="App-header">
      <AppHeaderBar
        signer={signer}
        setShouldLogin={setShouldLogin}
        accounts={accounts}
        title="FONDUE.LAND"
      />
      <div className="App-dashboard">
        <PixelBox className="App-dashboard-earnings">
          <h3>STATS</h3>
          {KeysInput(keyBalance, totalSupply)}
          {EntryEarnings(mice, fondueBalance)}
          {/* <p style={{ marginTop: "auto", display: "flex-block" }}>
            Round time totals 45 days, 20 hours, and 30 minutes.
          </p> */}
          {/* <PixelButton onClick={() => null} disabled>
            CLAIM
          </PixelButton> */}
        </PixelBox>
        {BuyKeys({ mice, daiBalance, approvedFor, daiContract: daiContract, price, contract: contract, Update: UpdateAll })}
        {Jackpot({ endDate, blocks, IS_FIRST_PLACE, places, endDateFormated })}
        <PixelBox className="App-dashboard-enter-jackpot">
          <h3>ENTER THE GAME</h3>
          <p>
            If you're the last individual to <span style={{fontSize: 'inherit', color: "#ffe251", textShadow: "2px 2px 0px #0c0b0b"}}>"Take The Pot"</span> you will win all the
            mice in the jackpot!
          </p>
          {TakeThePotInput({ signer, keyBalance, maxDepositable, fondueContract, ticketContract: contract, keysApprovedForFondue, Update: UpdateAll })}

        </PixelBox>
        <PixelBox className="App-dashboard-activity">
          <h3>ACTIVITY</h3>
          <ul>
            {events.map((i: {
              address: string;
              amount: number;
              cost?: number;
              id: string;
              createdAt: Date;
              type: "takeThePot" | "purchase"
            }) => (<><li className={i.type} key={i.id}>
              <div className={`buyer ${i.type}`}>
                <span className="highlight">{i.address.slice(0, 5)}<span>...</span>{i.address.slice(-3)}</span>{" "}
                {i.type === "takeThePot" ? <>took the pot using <span className="highlight">{numToShorthand(i.amount)} key{Math.floor(i.amount) !== 1 ? "s" : ""}!</span></> : `bought ${numToShorthand(i.amount)} key${Math.floor(i.amount) !== 1 ? "s" : ""}!`}
              </div>
              {/* display date as "x min ago" from i.createdAt */}
              <div className="timeago">{
                moment(i.createdAt).fromNow()
              }</div>
              {i.type === "purchase" ? <div className="amount"><span>@ ${((i.cost || (1 * i.amount)) / i.amount).toFixed(2)}/ea</span></div> : null}
            </li></>))}
          </ul>
        </PixelBox>
      </div>
    </header>
  );
}
function EntryEarnings(mice: number, fondueBalance: number) {
  return <><span
  style={{ width: "100%", marginTop: "1.5ch" }}
  className="input-wrapper clickable"
  onClick={
    () => window.open("https://dexscreener.com/harmony/0x40ab5b3d82e19fd63b07ce6eb92e38eb3129ac7d")
  }
>
  <span className={"input-title"}>
    FONDUE <HoverInfo text={"earn 1 fondue by depositing 1 key"} />
  </span>
  <input
    type="number"
    placeholder="0"
    className="mice-input "
    value={Math.floor((fondueBalance / 10 ** 9))}
    
    disabled={true} />
  <span style={{ position: 'absolute', right: '1ch', top: '1.5ch', zIndex: 1, fontSize: "0.75ch", color: "#0C0b0b" }}>FONDUE</span>
</span>
{/* <span
    style={{ width: "100%", marginTop: "1ch" }}
    className="input-wrapper"
  >
    <span className={"input-title"}>
      EARNINGS
      <HoverInfo text={"fondue holders receive 50% of all key revenue"} />
    </span>
    <input
      type="number"
      placeholder="0"
      className="mice-input"
      value={mice * 50}
      disabled={true} />
    <span style={{ position: 'absolute', right: '1ch', top: '1.5ch', zIndex: 1, fontSize: "0.75ch", color: "#0C0b0b" }}>DAI</span>
  </span> */}
  </>;
}

function Jackpot({ endDate, blocks, IS_FIRST_PLACE, places, endDateFormated }: { endDate: number; blocks: number; IS_FIRST_PLACE: boolean; places: string[]; endDateFormated: string; }) {
  const GAME_FINISHED = endDate - blocks < 0 && endDate > 0;
  return <PixelBox className="App-dashboard-jackpot">
    <h3>JACKPOT</h3>
    {GAME_FINISHED
      ? IS_FIRST_PLACE ? <h5><span>YOU</span> have won</h5> : <h5><span>{places[0].slice(0, 5)}<span>...</span>{places[0].slice(-3)}</span> has taken</h5>
      : places[0] === ethers.constants.AddressZero
        ? <h5>Be the <span>FIRST</span> to take</h5>
        : IS_FIRST_PLACE
          ? (<h5><span>YOU</span> are unlocking</h5>)
          : <h5><span>{places[0].slice(0, 5)}<span>...</span>{places[0].slice(-3)}</span> is unlocking</h5>}
    <h4>260 MICE!</h4>
    {GAME_FINISHED
      ? IS_FIRST_PLACE
        ? <><h5>CONGRATULATIONS!<br /><br /><i style={{ position: 'relative', zIndex: 2, color: "inherit", fontSize: "small" }}>your rewards will be sent out shortly, otherwise contact </i><span style={{ fontSize: "smaller" }}>CreativeBuilds#0001</span> <i style={{ position: 'relative', zIndex: 2, color: "inherit", fontSize: "small" }}>on discord</i></h5></>
        : <h5>better luck next time!</h5>
      : places[0] === ethers.constants.AddressZero
        ? <h5>and start the <span>FONDUE</span> pot!</h5>
        : <h5> {endDate > 0 ? `in ${endDate - blocks} blocks (${endDateFormated})` : ''}</h5>}
  </PixelBox>;
}

function BuyKeys({ mice, daiContract, daiBalance, price, approvedFor, contract, Update }: { Update: () => void, mice: number; daiContract: Contract | null, price: number; daiBalance: number; approvedFor: number; contract: Contract | null; }) {

  const [keys, setKeys] = useState(0);

  const TotalCost = GetAvgCost(price, keys);

  return <PixelBox className="App-dashboard-buy-keys absolute">
    <h3>BUY KEYS</h3>
    <p style={{lineHeight: '1.5ch'}}>Price of keys increases by <span style={{fontSize: 'inherit', color: "#ffe251", textShadow: "2px 2px 0px #0c0b0b"}}>$0.00033/key</span> minted.<br/>The next key will cost <span style={{fontSize: 'inherit', color: "#ffe251", textShadow: "2px 2px 0px #0c0b0b"}}>${price.toFixed(2)}</span></p>
    <div className="balances">
      <span>BAL</span>  
      <span>${daiBalance.toFixed(2)}</span>
    </div>
    <span
      style={{ width: "calc(100% - 2.25ch)" }}
      className="input-wrapper"
    >
      {/* <div className="max-mice">
          {!!signer ? (
            <PixelButton onClick={() => console.warn("IMPLEMENT MAX KEYS")}>max</PixelButton>
          ) : null}
        </div> */}
      <input
        value={keys}
        placeholder="0 "
        className="mice-input"
        style={{ marginTop: "0.5ch" }}
        onChange={UpdateKeys} />
    </span>
    <div className="prices" style={{ position: 'relative' }}>
      {price === 0 ? <span>LOADING...</span> : <><span style={{color: "#ffe251", textShadow: "2px 2px 0px #0c0b0b"}}>TOTAL</span>
      <span style={{color: "#ffe251", textShadow: "2px 2px 0px #0c0b0b"}}>${TotalCost}</span></>}
    </div>
    <div style={{width: "100%",  height: '4ch', display: "flex", alignItems: 'center'}}>
      {approvedFor > Number(TotalCost) 
        ? (<PixelButton disabled={keys === 0 || price === 0} onClick={() => contract?.PurchaseWithDAI(keys).then(Update())}>
      BUY
    </PixelButton>) 
        : (<PixelButton onClick={() => daiContract?.approve(contract?.address, ethers.constants.MaxUint256).then(Update())}>
          APPROVE
          </PixelButton>)}
    
    </div>
  </PixelBox>;

  function UpdateKeys(e: React.ChangeEvent<HTMLInputElement>) {
    let input = Math.floor(Number(e.target.value)) || 0;
    if (input >= MAX_KEYS_PER_TX) input = MAX_KEYS_PER_TX;
    setKeys(input);
  }
}

function numToShorthand(num: number) {
  let num_str = Number(num.toString().replace(/[^0-9.]/g, ''));
  if (num_str < 1000) {
    return num_str;
  }
  let si = [
    { v: 1E3, s: "K" },
    { v: 1E6, s: "M" },
    { v: 1E9, s: "B" },
    { v: 1E12, s: "T" },
    { v: 1E15, s: "P" },
    { v: 1E18, s: "E" }
  ];
  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (num_str >= si[index].v) {
      break;
    }
  }
  return (num_str / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
}

function GetIncreaseInCost(index: number) {
  return (index * 0.00033);
}

function GetAvgCost(price: number, total: number) {
  const base = price;
  const last = price + GetIncreaseInCost(total - 1);
  return (((base + last) / 2) * total).toFixed(2);
}

function TakeThePotInput({ signer, keyBalance, maxDepositable, fondueContract, ticketContract, keysApprovedForFondue, Update }: { Update: () => void; signer: Signer; keyBalance: number; maxDepositable: number; fondueContract: Contract | null; ticketContract: Contract | null; keysApprovedForFondue: boolean; }) {

  const [takeThePotInput, SetTakeThePotInput] = useState(0);

  return <><span
    style={{ width: "calc(100% - 2.5ch)" }}
    className="input-wrapper"
  >
    <div className="max-mice">
      {!!signer ? (
        <PixelButton
          style={{ marginRight: `2.5ch` }}
          onClick={() => SetTakeThePotInput(keyBalance > maxDepositable ? maxDepositable : keyBalance)}
        >
          max
        </PixelButton>
      ) : null}
    </div>
    {!!signer ? (
      <span className="mice-balance"
        style={{ marginRight: keyBalance.toString().length == 0 ? '0.75ch' : undefined }}>{numToShorthand(keyBalance)}</span>
    ) : null}
    <span className={"input-label" + (signer ? " mice" : "")}>🔑</span>
    <input
      placeholder="0"
      className="mice-input"
      value={takeThePotInput}
      onChange={UpdateTakeThePotInput}
    />
  </span>
    {keysApprovedForFondue ? (<PixelButton disabled={takeThePotInput == 0} onClick={() => fondueContract?.enterKeys(takeThePotInput * 10 ** 9).then(Update())}>
      TAKE THE POT
    </PixelButton>) : <PixelButton onClick={() => ticketContract?.setApprovalForAll(fondueContract?.address, true).then(Update())}>
      APPROVE
    </PixelButton>}

  </>;

  function UpdateTakeThePotInput(e: React.ChangeEvent<HTMLInputElement>) {
    let InputAmount = Math.floor(Number(e.target.value));
    if (isNaN(InputAmount)) return;
    if (InputAmount > maxDepositable) InputAmount = maxDepositable;
    if (InputAmount > keyBalance) return SetTakeThePotInput(keyBalance);
    SetTakeThePotInput(InputAmount);
  }
}

function KeysInput(keyBalance: number, totalSupply: number) {
  return <span
    style={{ width: "100%", marginTop: "2ch" }}
    className="input-wrapper"
  >
    <span className={"input-title"}>YOUR KEYS</span>
    <span className={"input-title"} style={{ left: 'unset', right: 0 }}>TOTAL KEYS</span>
    <input
      placeholder="0"
      className="mice-input"
      value={numToShorthand(keyBalance)}
      disabled={true}
      style={{fontSize: '0.8ch', height: '4em', fontWeight: 'bolder'}} />
    <span className={"input-overlay-middle"} >/</span>
    <span className={"input-overlay"} >{numToShorthand(totalSupply)}</span>
  </span>;
}

function HoverInfo({ text }: { text: string }) {
  return <div className="hover-info">
    <span className={"i-hover"}>i</span>
    <span className={"info-text"}>{text}</span>
  </div>;
}

