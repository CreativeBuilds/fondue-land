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

// eslint-disable-next-line no-use-before-define
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

  const gasPrice = (await d.provider.getGasPrice()).mul(100).div(40);
  // log gas
  console.log(`gasPrice: ${gasPrice.toString()}`);
  // current block
  const block = await d.provider.getBlock("latest");
  console.log(`block: ${block.number}`);
  // deployer address
  console.log(`deployer: ${deployer}`);
  // get deployer nonce
  let deployerNonce = await d.provider.getTransactionCount(deployer);

  /* DEPLOY 👇 */

  // deploy Test1155 as nft contract
  const Test1155 = await deploy("Test1155", {
    from: deployer,
    gasPrice: gasPrice.toNumber() * 2,
    args: [TestAddresses[0]],
    nonce: deployerNonce,
  });
  console.log(`Deployed Test1155 contract @ ${Test1155.address}`);

  deployerNonce = await d.provider.getTransactionCount(deployer);

  // deploy FondueTickets.sol
  const FondueTickets = await deploy("FondueTickets", {
    from: deployer,
    gasPrice,
    nonce: deployerNonce,
    args: [block.number, Test1155.address],
  });
  console.log(`Deployed FondueTickets contract @ ${FondueTickets.address}`);

  // new ethers contract
  const FondueTicketsContract = new ethers.Contract(
    FondueTickets.address,
    FondueTickets.abi,
    d
  );

  FondueTicketsContract.timeTillPresaleEnds().then((timeTillPresaleEnds) => {
    // log timeTillPresaleEnds seconds to formatted date
    console.log(
      `timeTillPresaleEnds: ${new Date(
        timeTillPresaleEnds.toNumber() * 1000
      ).toLocaleString()}`
    );
  });
};

module.exports.tags = ["FondueTickets"];

// Deprecated old FonduePot.sol (not used anymore)
function DeployFondueJackpot() {
  return async ({
    getNamedAccounts,
    deployments,
    /* getChainId */
  }) => {
    const { deploy } = deployments;
    const { deployer, alice, bob } = await getNamedAccounts();
    // get signers
    const [d, a, b] = await ethers.getSigners();

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
  };
}
