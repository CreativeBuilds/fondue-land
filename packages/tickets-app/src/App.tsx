import React, { useEffect } from "react";
import "./App.css";
import detectEthereumProvider from "@metamask/detect-provider";
import useProvider from "./helpers/useProvider";
import { PixelBox } from "./PixelBox/PixelBox";
import logo from "./logo.png";
import { PixelButton } from "./PixelButton/PixelButton";
import { useContract } from "./helpers/useContract";
import { Signer } from "ethers";
import { useFondueTickets } from "./helpers/useFondueTickets";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
const MAX_MICE_PER_TX = 100;

function App() {
  const [shouldLogin, setShouldLogin] = React.useState(true);

  const { accounts, signer, provider } = useProvider(shouldLogin);
  const [mice, setMice] = React.useState(0);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/dashboard"
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
        <Route
          path="/"
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
      </Routes>

      <NotificationContainer />
    </div>
  );

  function UpdateMice(mice: number) {
    console.log(mice);
    if (mice > MAX_MICE_PER_TX) {
      setMice(MAX_MICE_PER_TX);
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
  if(!title) title = "fondue.land";
  const ADDR = accounts[0]
    ? accounts[0].slice(0, 5) + "..." + accounts[0].slice(-3)
    : "";
    console.log(accounts, ADDR, !signer);
  return (
    <div className="App-header-bar">
      <img
        style={{ marginLeft: "0.25em", marginRight: "0.75em" }}
        src={logo}
        className="App-logo"
        alt="logo"
      />
      <div>{title}</div>
      <a href="https://docs.fondue.land/" target="_blank" style={{marginLeft: 'auto', fontSize: '0.8ch', marginRight: '1ch'}}>DOCS</a>
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
              {mice === MAX_MICE_PER_TX ? (
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
                  purchaseWithMice(mice).catch((err) =>
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
                    .catch((err) =>
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
    price,
    minted,
    approvedFor,
    keyBalance,
    miceBalance,
    endDate,
    approveAllMice,
    purchaseWithMice,
  } = useFondueTickets(signer);

  return (
    <header className="App-header">
      <AppHeaderBar
        signer={signer}
        setShouldLogin={setShouldLogin}
        accounts={accounts}
        title="DASHBOARD"
      />
      <div className="App-dashboard">
        <PixelBox className="App-dashboard-earnings">
          <h3>STATS</h3>
          {KeysInput(mice)}
          <span
            style={{ width: "100%", marginTop: "2ch" }}
            className="input-wrapper"
          >
            <span className={"input-title"}>
              ENTRY EARNINGS 
              <HoverInfo text={"players receive 50% of mint cost based on keys entered"} />
            </span>
            <input
              type="number"
              placeholder="0"
              className="mice-input"
              value={mice * 50}
              disabled={true}
            />
            <span style={{position: 'absolute', right: '1ch', top: '1ch', zIndex: 1, color: "#0C0b0b"}}>DAI</span>
          </span>
          <div style={{flex: 1, "width": "100%"}}></div>
          <p style={{ marginTop: "auto", display: "flex-block" }}>
            Round time totals 45 days, 20 hours, and 30 minutes.
          </p>
          <PixelButton onClick={() => null} disabled>
          CLAIM
          </PixelButton>
        </PixelBox>
        <PixelBox className="App-dashboard-buy-keys">
          <h3>BUY KEYS</h3>
          <p>Price of keys increases by $0.00033/key minted.</p>
          <span
            style={{ width: "calc(100% - 2.25ch)" }}
            className="input-wrapper"
          >
            <div className="max-mice">
              {!!signer ? (
                <PixelButton onClick={() => miceBalance}>max</PixelButton>
              ) : null}
            </div>
            <input
              value={mice}
              placeholder="0 "
              className="mice-input"
              style={{ marginTop: "0.5ch" }}
              onChange={(e) => e}
            />
            {mice === MAX_MICE_PER_TX ? (
              <span className="input-message">(max tx limit)</span>
            ) : null}
          </span>
          <PixelButton disabled={mice === 0} onClick={() => {}}>
            BUY
          </PixelButton>
        </PixelBox>
        <PixelBox className="App-dashboard-jackpot">
          <h3>JACKPOT</h3>
          <h5><span>0x498<span>...</span>348</span> is unlocking</h5>
          <h4>260 MICE!</h4>
          <h5>in 3 hours, 43 minutes, and 20 seconds</h5>
        </PixelBox>
        <PixelBox className="App-dashboard-enter-jackpot">
          <h3>ENTER THE GAME</h3>
          <p>
            If you're the last individual to "Take The Pot" you will win all the
            mice in the jackpot!
          </p>
          <span
            style={{ width: "calc(100% - 2.5ch)" }}
            className="input-wrapper"
          >
            <div className="max-mice">
              {!!signer ? (
                <PixelButton
                  style={{ marginRight: `calc(${0.5 + keyBalance.toString().length}ch)` }}
                  onClick={() => console.warn("TODO: Enter the game button")}
                >
                  max
                </PixelButton>
              ) : null}
            </div>
            {!!signer ? (
              <span className="mice-balance">{keyBalance}</span>
            ) : null}
            <span className={"input-label" + (signer ? " mice" : "")}>🔑</span>
            <input
              type="number"
              placeholder="0"
              className="mice-input"
              value={mice * 50}
              disabled={true}
            />
          </span>
          <PixelButton disabled={mice === 0} onClick={() => {}}>
            TAKE THE POT
          </PixelButton>
        </PixelBox>
        <PixelBox className="App-dashboard-activity">
          <h3>ACTIVITY</h3>
          <ul>
            {new Array(8).fill(0).map((_, i) => (<li>
              <div className="buyer">
                <span className="highlight">0x378<span>...</span>985</span>{" "}bought keys!
              </div>
              <div className="timeago">3 min ago</div>
              <div className="amount"><span>7</span><span>🔑</span><span>@ $0.50/ea</span></div>
            </li>))}
          </ul>
        </PixelBox>
      </div>
    </header>
  );
}
function KeysInput(mice: number) {
  return <span
    style={{ width: "100%", marginTop: "2ch" }}
    className="input-wrapper"
  >
    <span className={"input-title"}>YOUR KEYS</span>
    <span className={"input-title"} style={{ left: 'unset', right: 0 }}>TOTAL KEYS</span>
    <input
      type="number"
      placeholder="0"
      className="mice-input"
      value={mice * 50}
      disabled={true} />
    <span className={"input-overlay-middle"} >/</span>
    <span className={"input-overlay"} >0</span>
  </span>;
}

function HoverInfo({text}: {text: string}) {
  return <div className="hover-info">
    <span className={"i-hover"}>i</span>
    <span className={"info-text"}>{text}</span>
  </div>;
}

