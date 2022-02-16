import { BigNumber, Contract, ethers, Signer } from "ethers";
import { useEffect, useRef, useState } from "react";
import { useContract } from "./useContract";

const NFT_CONTRACT = "0x4e9c30CbD786549878049f808fb359741BF721ea";
const NFTABI = [
  "function setApprovalForAll(address _operator, bool _approved) external",
  "function isApprovedForAll(address _owner, address _operator) view returns (bool)",
  "function balanceOf(address _owner, uint256 id) view returns (uint256)",
];

export function useFondueTickets(signer: Signer) {
  const presaleContract = useContract('FondueTickets', signer);
  const [nftContract, setNftContract] = useState<Contract | null>(new Contract(NFT_CONTRACT, NFTABI, signer))
  const [currentPrice, setCurrentPrice] = useState(0);
  const [totalTicketsMinted, setTotalTicketsMinted] = useState(0);
  const [endDate, setEndDate] = useState(0);
  const [miceBalance, setMiceBalance] = useState(0);
  const [keyBalance, setKeyBalance] = useState(0);
  const [approvedFor, setApprovedFor] = useState(false);


  useEffect(() => {
    (UpdateContractInfo())();
  }, [presaleContract]);

  useEffect(() => {
    (UpdateMiceInfo())();
  }, [nftContract]);

  useEffect(() => {
    let timeout = setInterval(() => {
      setEndDate(endDate - 1);
    }, 1000);
    return () =>
      clearInterval(timeout);
  }, [endDate])

  useEffect(() => {
    if(signer)
      setNftContract(new Contract(NFT_CONTRACT, NFTABI, signer));
    else
      setNftContract(null);
  }, [signer])

  return {
    approvedFor,
    contract: presaleContract, 
    keyBalance,
    price: currentPrice, 
    minted: totalTicketsMinted, 
    miceBalance,
    endDate: formatEndDate(endDate), 
    approveAllMice,
    purchaseWithMice,
  }

  function UpdateMiceInfo() {
    return async () => {
      Promise.all([
        signer?.getAddress()?.then(address => nftContract?.isApprovedForAll(address, presaleContract?.address)),
        signer?.getAddress()?.then(address => nftContract?.balanceOf(address, 0)),
      ]).then(([a, b]) => {
        // log ab
        console.log(a, b, "a b");
        setApprovedFor(a);
        setMiceBalance((b as BigNumber).toNumber());
      });
    };
  }

  function UpdateContractInfo() {
    return async () => {
      Promise.all([
        presaleContract?.CHEEZ_PRICE().then((num: ethers.BigNumber) => num.toNumber() / 10 ** 9),
        presaleContract?.totalTicketsMintedAtPresale().then((num: ethers.BigNumber) => num.toNumber()),
        presaleContract?.timeTillPresaleEnds().then((num: ethers.BigNumber) => num.toNumber()).catch(() => BigNumber.from(0)),
        signer?.getAddress()?.then(address => presaleContract?.balanceOf(address, 0).then((num: ethers.BigNumber) => num.toNumber() / 10 ** 9)).catch(() => 0),
      ]).then(([a, b, c, d]) => {
        setCurrentPrice(a);
        setTotalTicketsMinted(b);
        setEndDate(c * 2.2);
        setKeyBalance(d);
      });
    };
  }

  function formatEndDate(endDate: number) {
    const seconds = Math.floor(endDate % 60);
    const minutes = Math.floor(endDate / 60) % 60;
    const hours = Math.floor(endDate / 3600);
    
    return endDate <= 0 ? `` : `~${hours > 0 ? hours + 'h' : ''} ${minutes > 0 ? minutes + 'm' : ''} ${seconds > 0 ? seconds + 's' : ''}`;
  }

  async function purchaseWithMice(amountOfMice: number) {
    console.log("trying to buy", amountOfMice, "mice");
    return presaleContract?.purchaseWithMice(amountOfMice)
    .then((tx: any) => tx.wait(1))
    .then(() => Promise.all([UpdateContractInfo()(), UpdateMiceInfo()()]))
  }
  async function approveAllMice() {
    console.log('approval mice')
    return nftContract?.setApprovalForAll(presaleContract?.address, true)
    .then((tx: any) => tx.wait(1))
    .then(() => (UpdateMiceInfo()()));
  }
}