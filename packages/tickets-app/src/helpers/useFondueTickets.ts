import { Contract, ethers, Signer } from "ethers";
import { useEffect, useRef, useState } from "react";
import { useContract } from "./useContract";
import * as countdown from 'countdown';

export function useFondueTickets(signer: Signer) {
  const presaleContract = useContract('FondueTickets', signer);
  const nftContract = useRef(new Contract("", [], signer))
  const [currentPrice, setCurrentPrice] = useState(0);
  const [totalTicketsMinted, setTotalTicketsMinted] = useState(0);
  const [endDate, setEndDate] = useState(0);
  const [miceBalance, setMiceBalance] = useState(0);
  const [approvedFor, setApprovedFor] = useState(0);

  useEffect(() => {
    (async () => {
        Promise.all([
            presaleContract?.CHEEZ_PRICE().then((num: ethers.BigNumber) => num.toNumber() / 10 ** 9),
            presaleContract?.totalTicketsMinted().then((num: ethers.BigNumber) => num.toNumber()),
            presaleContract?.timeTillPresaleEnds().then((num: ethers.BigNumber) => num.toNumber())
        ]).then(([a, b, c]) => {
            setCurrentPrice(a);
            setTotalTicketsMinted(b);
            setEndDate(c * 2.2);
        })
    })()
  }, [presaleContract]);

  useEffect(() => {
    let timeout = setInterval(() => {
      setEndDate(endDate - 1);
    }, 1000);
    return () =>
      clearInterval(timeout);
  }, [endDate])

  return {contract: presaleContract, price: currentPrice, minted: totalTicketsMinted, endDate: formatEndDate(endDate), purchaseWithMice}

  function formatEndDate(endDate: number) {
    const seconds = Math.floor(endDate % 60);
    const minutes = Math.floor(endDate / 60) % 60;
    const hours = Math.floor(endDate / 3600);
    
    return endDate <= 0 ? `` : `~${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''} ${seconds > 0 ? seconds + 's' : ''}`;
  }

  async function purchaseWithMice(amountOfMice: number) {
    console.log("trying to buy", amountOfMice, "mice");
    presaleContract?.purchaseWithMice(amountOfMice).then((tx: any) => {
      console.log(tx);

    })
  }
}