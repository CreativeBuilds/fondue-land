import React from 'react';
import './App.css';
import detectEthereumProvider from '@metamask/detect-provider';
import useProvider from './helpers/useProvider';
import { PixelBox } from './PixelBox/PixelBox';
import logo from './logo.png';
import { PixelButton } from './PixelButton/PixelButton';

function App() {
  const [mice, setMice] = React.useState(0);
  
  const {accounts, getSigner, signOut} = useProvider();

  const MAX_MICE_PER_TX = 100;

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-bar">
          {/* image of logo from ./public/logo.png at a square size */}
          <img style={{marginLeft: '0.25em', marginRight: '0.75em'}} src={logo} className="App-logo" alt="logo" />
          <div>KEY PRESALE</div>
          {
            accounts.length === 0 ?
            <PixelButton style={{marginTop:'-0.5em', minWidth: '8ch', height: '2ch', marginRight:'1ch'}} onClick={getSigner}>CONNECT</PixelButton> :
            <>
            <div style={{marginLeft: 'auto'}}>{accounts[0].slice(0, 5)}...{accounts[0].slice(-3)}</div>
            <PixelButton style={{marginLeft: '1em', marginTop:'-0.5em', minWidth: '11ch', height: '2ch', marginRight:'1ch'}} onClick={() => {
              // disconnect from web3

              // first disconnect from metamask @TODO
              signOut();
            }}>DISCONNECT</PixelButton>
            </>
          }
          
        </div>
        <div className="App-presale">
          <h3>KEY PRESALE</h3>
          <p>69h 42m 30s</p>
          <PixelBox className="App-presale-dialog">
          <div className="App-presale-total-minted">
            <span>298 / 1000</span>
            <div  style={{width:"29.8%"}} className="progress"/>
          </div>
          <h4 style={{marginBottom: '0.5em'}}>MINT KEYS</h4>
          <span style={{width: 'calc(100% - 2.25ch)'}} className="input-wrapper">
            <span className="input-label">🐭</span>
            <input value={mice} placeholder='0 ' className="mice-input" onChange={e => handleMiceInput(e)}  />
            {mice === MAX_MICE_PER_TX ? <span className="input-message">(max tx limit)</span> : null}
          </span>
          <div className="arrow-box"><span>👇</span></div>
          <span style={{width: 'calc(100% - 2.25ch)'}} className="input-wrapper" >
            <span className="input-label" >🔑</span>
            <input type="number" placeholder='0' className="mice-input" value={mice*24} disabled={true} />
          </span>
            <br/>
          <b style={{fontSize:"0.5em"}}> 1 mouse = 24 keys</b>
          <br/>
          {
          accounts.length === 0 ? 
            <PixelButton onClick={getSigner}>Connect Wallet</PixelButton> : 
            <PixelButton disabled={mice === 0} onClick={() => {
              // web3 signin
            }}>MINT <span style={{
              fontSize: '2em',
              marginTop: '-0.4em',
              marginLeft: '0.5em'
            }}>🗝</span><span style={{fontSize:"0.75em"}}>'s</span></PixelButton>
          }
            
          </PixelBox>
        </div>
      </header>
    </div>
  );

  function handleMiceInput(e: React.ChangeEvent<HTMLInputElement>): void {
    const input = Math.floor(Number(e.target.value)) || 0;
    // trim leading zeros
    const mice = Number(input.toString().replace(/^0+/, ''));
    if(isNaN(Math.floor(Number(e.target.value)))) return;
    if(mice > MAX_MICE_PER_TX) {
      setMice(MAX_MICE_PER_TX);
    } else
    setMice(Number(mice));
  }
}

export default App;
