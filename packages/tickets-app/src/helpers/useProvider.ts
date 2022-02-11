import detectEthereumProvider from '@metamask/detect-provider';
import { useEffect, useState } from 'react';
import * as ethers from 'ethers';
interface EthereumProvider {
    isMetaMask?: boolean;
}

function useProvider(shouldSignIn: boolean = true) {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [accounts, setAccounts] = useState<string[]>([]);

    useEffect(() => {
        /* If user has "logged out" clear signer */
        if(!shouldSignIn && signer) setSigner(null);
    }, [shouldSignIn, signer])

    /* Detect base web3 provider / accounts (read only) */
    useEffect(() => {
        (async () => {
            let provider = await detectEthereumProvider();
            const ethersProvider = new ethers.providers.Web3Provider(provider as EthereumProvider);
            setProvider(ethersProvider);
            const accounts = await ethersProvider.listAccounts();
            setAccounts(accounts);
        })();
    }, []);

    /* listen to accounts change, and update state accordingly */
    useEffect(() => {
        if (provider) {
            provider.on('accountsChanged', (accounts: string[]) => {
                setAccounts(accounts);
            });
        }
    }, [provider]);

    /* Detect signer (read/write) if shouldSignIn */
    useEffect(() => {
        if (provider && accounts.length > 0) {
            (async () => {
                const signer = await getSigner();
                if(signer)
                    setSigner(signer);

                async function getSigner() {
                    if(!accounts || accounts.length === 0) {
                        if(shouldSignIn) await provider?.send('eth_requestAccounts', []).then(setAccounts);
                        return provider?.getSigner();
                    }
                    if(provider && shouldSignIn)
                        return provider.getSigner();
                    else
                        return null;
                }
            })();
        } else {
            setSigner(null);
        }
    }, [provider, accounts, shouldSignIn]);
    
    return {accounts, provider, signer, signOut};
    
    async function signOut() {
        setAccounts([]);
    }
    
}

useProvider.prototype.Provider = ethers.providers.Web3Provider;

export default useProvider;

