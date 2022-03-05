import { BigNumber, Contract, ethers, Signer } from "ethers";
import { useEffect, useMemo, useRef, useState } from "react";
import { useContract } from "./useContract";

const DAI_ADDRESS = "0xef977d2f931c1978db5f6747666fa1eacb0d0339";
const ERC20ABI = [
  "function approve(address _operator, uint amount) external returns (bool success)",
  "function allowance(address _owner, address _spender) view returns (uint256 remaining)",
  "function balanceOf(address _owner) view returns (uint256)",
];

export function useFondueTicketsV2(signer: Signer) {
  const ticketContract = useContract('DummyTickets', signer);
  const fondueContract = useContract('TheFondueMicePot', signer)
  const [currentPrice, setCurrentPrice] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [keyBalance, setKeyBalance] = useState(0);
  const [daiBalance, setDaiBalance] = useState(0);
  const [fondueBalance, setFondueBalance] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [approvedFor, setApprovedFor] = useState(0);
  const [maxDepositable, setMaxDepositable] = useState(0);
  const [blocks, setBlocks] = useState(0);
  const [keysApprovedForFondue, setKeysApprovedForFondue] = useState(false);
  const [places, setPlaces] = useState([ethers.constants.AddressZero,ethers.constants.AddressZero]);
  const [endDate, setEndDate] = useState(0);
  const daiContract = useMemo(() => new Contract(DAI_ADDRESS, ERC20ABI, signer), [signer]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    GetActivityData().then(({block, events}) => {
      setEvents((events.slice(0, 15) as []).map((i: any) => {
        const obj = {
          ...i,
          createdAt: new Date(i.createdAt * 1000),
          type: i.purchaser ? "purchase" : "takeThePot",
          address: i.purchaser ? i.purchaser : i.depositer,
        };

        if(obj.type === "purchase") {
          obj.cost = Number(i.cost.toString()) / 10 ** 18;
        }
        return obj;
      }) as []);
    });
  }, [places, endDate, totalSupply])


  useEffect(() => {
    const listener: ethers.providers.Listener = (block) => {
      setBlocks(block);
    };
    // listen for current block and call setBlock
    if (signer?.provider){
      signer.provider?.on('block', listener);
      return () => {signer.provider?.removeListener('block', listener)}
    };
  }, [signer])


  useEffect(() => {
    (UpdateContractInfo())();
  }, [ticketContract]);

  useEffect(() => {
    (UpdateDaiInfo())();
  }, [daiContract]);
  
  useEffect(() => {
    (UpdateFondueInfo())();
  }, [fondueContract]);

  useEffect(() => {
    setTimeout(() => {
      UpdateAll()();
      }, 1000 * 7.5)}, []
    );  

  useEffect(() => {
    let timeout = setTimeout(() => {
      setEndDate(endDate - 1);
    }, 2200);
    return () => clearInterval(timeout);
  }, [endDate]);

  return {
    approvedFor,
    blocks,
    contract: ticketContract, 
    daiContract,
    events,
    endDate,
    endDateFormated: BlocksToDate(endDate - blocks),
    fondueBalance,
    fondueContract,
    daiBalance,
    keyBalance,
    keysApprovedForFondue,
    maxDepositable,
    price: currentPrice, 
    totalSupply,
    places,
    UpdateAll,
    UpdateContractInfo,
    UpdateDaiInfo,
    UpdateFondueInfo
  } 

  // waits for tx if passed in
  function UpdateAll() {
    return (tx?: ethers.providers.TransactionResponse) => {
      return (tx ? tx?.wait(1): Promise.resolve()).then(() => Promise.all([
        UpdateContractInfo()(),
        UpdateDaiInfo()(),
        UpdateFondueInfo()()
      ]))
    }
  }

  function UpdateFondueInfo() {
    return async () => {
      return signer?.getAddress()?.then(address => Promise.all([
        fondueContract?.rewards(address), 
        fondueContract?.maxDepositable().then((num: ethers.BigNumber) => num.toNumber()).catch(() => 0),
        Promise.all([fondueContract?.first_place(),
          fondueContract?.second_place()]),
          fondueContract?.timer_end_date().then((num: ethers.BigNumber) => num.toNumber()).catch(() => 0),
          fondueContract?.balanceOf(address),
      ])).then(([rewards, d, [first, second], endDate, fondueBal]) => {
        setRewards(rewards);
        setMaxDepositable(d);
        setPlaces([first, second]);
        setEndDate(endDate);
        setFondueBalance(fondueBal);
      })
    }
  };

  function UpdateDaiInfo() {
    return async () => {
      signer?.getAddress().then(address => Promise.all([
        daiContract?.allowance(address, ticketContract?.address),
        daiContract?.balanceOf(address),
      ]).then(([a, b]) => {
        console.log(Number(b.toString()));
        setApprovedFor(Number((Number(a.toString()) / 10 ** 18).toFixed(2)));
        setDaiBalance(Number((Number(b.toString()) / 10 ** 18).toFixed(2)));
      }));
    };
  }


  function UpdateContractInfo() {
    return async () => {
      signer?.getAddress()?.then(address => Promise.all([
        ticketContract?.totalSupply(0),
        ticketContract?.balanceOf(address, 0).then((num: ethers.BigNumber) => num.toNumber() / 10 ** 9).catch(() => 0),
        ticketContract?.isApprovedForAll(address, fondueContract?.address),
        ticketContract?.GetCost(1),
      ])).then(([a,b,c,d]) => {
          setTotalSupply(a.toNumber() / 10 ** 9);
          setKeyBalance(b);
          setKeysApprovedForFondue(c);
          setCurrentPrice(Number((Number(d.toString()) / 10 ** 18).toFixed(4)));
      });
    };
  }

  function BlocksToDate(blocks: number, secondsPerBlock = 2.2) {
    const seconds = blocks * secondsPerBlock;
    
    // format as "x hours, y minutes, z seconds"
    const parts = [
      Math.floor(seconds / (60 * 60)) % 24,
      Math.floor(Math.floor((seconds % (60 * 60))) / 60),
      Math.floor((seconds % (60 * 60))) % 60,
    ];
    const labels = ['hour', 'minute', 'second'];
    const formatted = parts.map((part, index) => {
      return part ? `${part} ${labels[index]}${part > 1 ? 's' : ''}` : '';
    }).filter(Boolean).join(', ');
    return formatted;
}
  
}

async function GetActivityData() {
  const data = await fetch("https://graph.t.hmny.io/subgraphs/name/fondueland", {
    "headers": {
      "accept": "application/json",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
    },
    "body": "{\"query\":\"{\\n  _meta {\\n    block { number }\\n  }\\n  \\n  purchases (first: 20, orderBy: createdAt, orderDirection: desc) {\\n    createdAt\\n    amount\\n   cost\\n   id\\n    purchaser\\n  }\\n  \\n  takeThePots (first: 20, orderBy: createdAt, orderDirection: desc) {\\n    createdAt\\n    amount\\n    id\\n    depositer\\n  }\\n}\",\"variables\":null,\"operationName\":null}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  }).then(b => b.json()).then(d => d.data);

  const block = data._meta.block.number;
  const purchases = data.purchases;
  const takeThePots = data.takeThePots;

  // merge purchase events and takeThePot events into one array and order by createdAt
  const events = [...purchases, ...takeThePots].sort((b,a) => {
    return a.createdAt - b.createdAt;
  }
  );

  return {events, block};
}