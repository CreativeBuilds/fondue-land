/* eslint-disable no-unused-vars */
// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

// const localChainId = "31337";

const TestAddresses = [
  "0xB72C0Bd8e68De7de2Bf99abe238Ad7d18F9daaF7",
  "0x3CD98CB8962EbDe57515F8843dd0D2AeE0A6C37B",
];

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );

module.exports = async ({
  getNamedAccounts,
  deployments,
  /* getChainId */
}) => {
  const { deploy } = deployments;
  const { deployer, alice, bob } = await getNamedAccounts();
  // const chainId = await getChainId();

  // get signers
  const [d, a, b] = await ethers.getSigners();

  console.log(deployer, alice, bob);

  // get gas price
  const gasPrice = (await d.provider.getGasPrice()).mul(100).div(80);
  const fakeCheez = await deploy("FakeCheez", {
    from: deployer,
    log: true,
    args: [],
    gasPrice: gasPrice.toNumber() * 2,
  });
  console.log(`Deployed fakeCheez contract @ ${fakeCheez.address}`);
  await sleep(2000);
  let fondue = await deploy("FonduePot", {
    from: deployer,
    gasPrice: gasPrice.toNumber() * 2,
    args: [fakeCheez.address],
  });
  console.log(`Deployed fondue contract @ ${fondue.address}`);
  fondue = await (
    await ethers.getContractAt("FonduePot", fondue.address)
  ).connect(d);
  
  await sleep(2000);
  const cheez = await (
    await ethers.getContractAt("FakeCheez", fakeCheez.address)
  ).connect(d);

  // send fakeCheez to TestAddresses
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < TestAddresses.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await cheez.transfer(TestAddresses[i], 1000 * 10 ** 9, {
      gasPrice: gasPrice.toNumber() * 2,
    });
    console.log(`Sent 1000 fakeCheez to ${TestAddresses[i]}`);
  }

  const canDeposit = await fondue.canDeposit();

  // if cant deposit initPot
  if (!canDeposit) {
    console.log("Initializing fondue pot...");
    await fondue.connect(d).initPot({ gasPrice: gasPrice.toNumber() * 2 });
    console.log("Initialized fondue pot");
  }

  console.log("ready...");

  // Get cheez balance for alice and bob
  // eslint-disable-next-line no-use-before-define
  // await DepositAliceAndBob();

  async function DepositAliceAndBob() {
    const aliceCheezBalance = await cheez.balanceOf(alice);
    const bobCheezBalance = await cheez.balanceOf(bob);
    console.log(`Alice has ${aliceCheezBalance} cheez`);
    console.log(`Bob has ${bobCheezBalance} cheez`);

    // if canDeposit, have account alice deposit 0.01 CHEEZ
    await cheez.connect(a).approve(address, aliceCheezBalance);
    console.log("approved alice to deposit 0.01 cheez");
    // deposit 0.1 CHEEZ
    await fondue.connect(a).deposit(Math.floor(0.1 * 10 ** 9), {
      gasLimit: 1000000,
    });
    console.log("deposited");

    // wait for deposit to be processed
    await sleep(5000);

    let currentRound = await fondue.roundId();
    console.log(`Current round id: ${currentRound}`);

    // get amount of entries
    const amountOfEntries = await fondue.getEntries();
    console.log(`Amount of entries: ${amountOfEntries}`);

    // get first entry
    const firstEntry = await fondue.entries(0);
    console.log(`First entry: ${firstEntry}`);

    // Get alice win chance
    const aliceWinChance = await fondue.getWinChance(0).catch((err) => {
      console.log(err);
      return -1;
    });
    console.log(`Alice win chance: ${aliceWinChance} / 10000`);

    // have bob deposit 0.01 cheez
    await cheez.connect(b).approve(address, bobCheezBalance);
    // use increased gas limit
    await fondue.connect(b).deposit(Math.floor(0.1 * 10 ** 9), {
      gasLimit: 1000000,
    });
    console.time("time till close");
    await sleep(5000);

    // get bobs entry
    const bobEntry = await fondue.entries(1);
    console.log(`Bob entry: ${bobEntry}`);

    // get bobs win chance
    const bobWinChance = await fondue.getWinChance(1);
    console.log(`Bob win chance: ${bobWinChance} / 10000`);

    // get alices new win chance
    const aliceNewWinChance = await fondue.getWinChance(0);
    console.log(`Alice new win chance: ${aliceNewWinChance} / 10000`);

    // function that loops until blocksTillClose is 0
    const loop = async () => {
      // eslint-disable-next-line no-underscore-dangle
      const secondsTillClose = await fondue.secondsTillClose().catch(() => 120);
      console.log(`Blocks till close: ${secondsTillClose}`);
      if (Number(secondsTillClose.toString()) > 0) {
        await sleep(5000);
        await loop();
      } else {
        console.timeEnd("time till close");
      }
    };

    await loop();

    // close pool
    await fondue.connect(a).closePreviousRound({ gasLimit: 1000000 });

    await sleep(5000);
    // get current round
    currentRound = await fondue.roundId();
    console.log(`Current round id: ${currentRound}`);
  }
  // // attempt to get random number
  // const randomNumber = await fondue.getRand(100);
  // console.log(randomNumber.toString());

  /*  await YourContract.setPurpose("Hello");
  
    To take ownership of yourContract using the ownable library uncomment next line and add the 
    address you want to be the owner. 
    // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["FonduePot"];
