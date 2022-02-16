import React, { useEffect } from 'react';
import './App.css';
import detectEthereumProvider from '@metamask/detect-provider';
import useProvider from './helpers/useProvider';
import { PixelBox } from './PixelBox/PixelBox';
import logo from './logo.png';
import { PixelButton } from './PixelButton/PixelButton';
import { useContract } from './helpers/useContract';
import { Signer } from 'ethers';
import { useFondueTickets } from './helpers/useFondueTickets';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [mice, setMice] = React.useState(0);
  const [shouldLogin, setShouldLogin] = React.useState(true);
  
  const {accounts, signer, provider} = useProvider(shouldLogin);
  const {price, minted, approvedFor, keyBalance, miceBalance, endDate, approveAllMice, purchaseWithMice} = useFondueTickets(signer ? signer : (provider as any))
  
  useEffect(() => {
    if(!signer) UpdateMice(0);
  }, [signer])

  const MAX_MICE_PER_TX = 100;

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-bar">
          {/* image of logo from ./public/logo.png at a square size */}
          <img style={{marginLeft: '0.25em', marginRight: '0.75em'}} src={logo} className="App-logo" alt="logo" />
          <div>KEY PRESALE</div>
          {
            !signer ?
            <PixelButton style={{marginTop:'-0.5em', minWidth: '8ch', height: '2ch', marginRight:'1ch'}} onClick={() => setShouldLogin(true)}>CONNECT</PixelButton> :
            <>
            <div className="App-header-bar-account" style={{marginLeft: 'auto'}}>{accounts[0].slice(0, 5)}...{accounts[0].slice(-3)}</div>
            <PixelButton style={{marginLeft: '1em', marginTop:'-0.5em', minWidth: '11ch', height: '2ch', marginRight:'1ch'}} onClick={() => setShouldLogin(false)}>DISCONNECT</PixelButton>
            </>
          }
          
        </div>
        <div className="App-presale">
          <div className="App-fondue-info">
            <p>INFO BOARD</p>
            <PixelBox className="App-presale-info">
              <span style={{fontSize:'0.75em'}}>welcome to the fondue.land presale</span>
              <br/>
              <br/>
              <span style={{fontSize:'0.75em'}}>trade your cheesedao mice for <b style={{fontSize:'1em', color: 'white'}}>keys</b>. keys can later be entered for a chance to win a jackpot of mice</span>
              <br/>
              <br/>
              <span style={{fontSize:'0.75em'}}><b style={{fontSize:'1em', color: 'white'}}>CHEEZ</b> earned from mice will be used to buy mice off market to increase the <b style={{fontSize: '1em', color:'white'}}>Fondue Pots</b> value</span>
              <br/>
              <br/>
              <span style={{fontSize:'0.75em'}}>Keys can be minted post-presale, the profits of which will be redistributed pro-rata to all cheezers inside the <b style={{fontSize:'1em', color: 'white'}}>Fondue Pot</b></span>
              <br/>
              <br/>
              <span style={{fontSize:'0.75em'}}>For more info ask for <b style={{fontSize:'1em', color: 'white'}}>creative</b> on <a 
                    target="_blank"
                    href="https://discord.gg/dU4usXbqP6" 
                    rel="noreferrer"
                    style={{
                      color: '#FFE251',
                      fontWeight: 'bold',
                      fontStyle: 'unset',
                      fontSize: '1.1em',
                    }}>discord</a>
              </span>
            </PixelBox>
          </div>
          <div className="App-presale-mint">
            <h3>KEY PRESALE</h3>
            <p>{endDate}</p>
            <PixelBox className="App-presale-dialog">
            <div className="App-presale-total-minted">
              <span>{minted} / 25000</span>
              <div  style={{width:`${(minted / 25000) * 100}%`}} className="progress"/>
            </div>
            <h4 style={{marginBottom: '1em', marginTop: '2ch'}}>MINT KEYS</h4>
            <span style={{width: 'calc(100% - 2.25ch)'}} className="input-wrapper">
              <div className="max-mice"> 
                {!!signer ? <PixelButton onClick={() => UpdateMice(miceBalance)}>max</PixelButton> : null}
              </div>
                {!!signer ? <span className="mice-balance">{miceBalance}</span> : null}
              <span className={'input-label' + (signer ? " mice" : '')}>🐭</span>
              <input value={mice} placeholder='0 ' className="mice-input" onChange={e => handleMiceInput(e)}  />
              {mice === MAX_MICE_PER_TX ? <span className="input-message">(max tx limit)</span> : null}
            </span>
            <div className="arrow-box"><span>👇</span></div>
            <span style={{width: 'calc(100% - 2.25ch)'}} className="input-wrapper" >
              {!!signer ? <span className="mice-balance">{keyBalance}</span> : null}
              <span className={"input-label" + (signer ? " mice" : '')} >🔑</span>
              <input type="number" placeholder='0' className="mice-input" value={mice*50} disabled={true} />
            </span>
              <br/>
            <b style={{fontSize:"0.5em"}}> 1 mouse = 50 keys</b>
            <br/>
            {
            !signer ? 
              <PixelButton onClick={() => setShouldLogin(true)}>Connect Wallet</PixelButton> : 
              approvedFor ? 
              <PixelButton disabled={mice === 0} onClick={() => {
                // web3 signin
                purchaseWithMice(mice).catch(err => NotificationManager.error(err.data.message, null, 5000));
              }}>MINT <span style={{
                fontSize: '2em',
                marginTop: '-0.4em',
                marginLeft: '0.5em'
              }}>🗝</span><span style={{fontSize:"0.75em"}}>'s</span></PixelButton> :
              <PixelButton onClick={() => {
                // web3 signin
                approveAllMice().then().catch(err => NotificationManager.error(err.data.message, null, 5000));
              }}>APPROVE</PixelButton>
              
            }
              
            </PixelBox>
          </div>
        </div>
      </header>
      <NotificationContainer />
    </div>
  );

  function handleMiceInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const input = Math.floor(Number(e.target.value)) || 0;
    // trim leading zeros
    const mice = Number(input.toString().replace(/^0+/, ''));
    if(isNaN(Math.floor(Number(e.target.value)))) return;
    UpdateMice(mice);
  }

  function UpdateMice(mice: number) {
    console.log(mice)
    if (mice > MAX_MICE_PER_TX) {
      setMice(MAX_MICE_PER_TX);
    }
    else
      setMice(Number(mice));
  }
}

export default App;
