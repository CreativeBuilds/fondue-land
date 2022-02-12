import { Contract, ethers, Signer } from "ethers";
import { useEffect, useState } from "react";

export function useContract(name: string, signerOrProvider: Signer | null): Contract | null {
    const [contract, setContract] = useState<Contract | null>(null)

    useEffect(() => {
        const instance = new ethers.Contract(
            require(`../contracts/${name}.address.js`),
            require(`../contracts/${name}.abi.js`),
            signerOrProvider ? signerOrProvider : undefined
        );
        setContract(instance);
    }, [name, signerOrProvider]);

    return contract;
}