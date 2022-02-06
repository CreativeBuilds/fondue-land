import detectEthereumProvider from '@metamask/detect-provider';
import { useEffect, useState } from 'react';
import * as ethers from 'ethers';
interface EthereumProvider {
    isMetaMask?: boolean;
}

function useProvider() {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [accounts, setAccounts] = useState<string[]>([]);
    useEffect(() => {
        (async () => {
            let provider = await detectEthereumProvider();
            console.log("got provider", provider);
            const ethersProvider = new ethers.providers.Web3Provider(provider as EthereumProvider);
            setProvider(ethersProvider);
            const accounts = await ethersProvider.listAccounts();
            setAccounts(accounts);
        })();
    }, []);

    useEffect(() => {
        if (provider) {
            provider.on('accountsChanged', (accounts: string[]) => {
                setAccounts(accounts);
            });
        }
    }, [provider]);

    useEffect(() => {
        console.log("accounts changed", accounts);
    }, [accounts]);
    
    return {accounts, provider, getSigner, signOut};

    async function getSigner() {
        if(!accounts || accounts.length === 0) {
            await provider?.send('eth_requestAccounts', []).then(setAccounts);
            return provider?.getSigner();
        }
        if(provider)
            return provider.getSigner();
    }
    
    async function signOut() {
        setAccounts([]);
    }
}

useProvider.prototype.Provider = ethers.providers.Web3Provider;

export default useProvider;

