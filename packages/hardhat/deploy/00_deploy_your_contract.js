/* eslint-disable no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");
const { hrtime } = require("process");

// const localChainId = "31337";

const TestAddresses = [
  "0xB72C0Bd8e68De7de2Bf99abe238Ad7d18F9daaF7",
  "0x3CD98CB8962EbDe57515F8843dd0D2AeE0A6C37B",
];

const OGMinters = [
  {
      "minter": "0xef21e7c9fcbf76e1741e836f6c2879504549b3dc",
      "minted": 3 * 50
  },
  {
      "minter": "0x572c9cfb29746615f67dedd38f7daabd8addcbd1",
      "minted": 1 * 50
  },
  {
      "minter": "0x334dc1d8f223ba692449f1a4ea07d1d36c335125",
      "minted": 1 * 50
  },
  {
      "minter": "0xd40fc0beb479479b8beccac3196996e1e3cbb610",
      "minted": 2 * 50
  },
  {
      "minter": "0xf9911e360c6e5e3e1699a3a828c493136f25c63c",
      "minted": 1 * 50
  },
  {
      "minter": "0x692b01518dc87b8eaa3906147423e9941492726c",
      "minted": 2 * 50
  },
  {
      "minter": "0x8495ccacba569f3dc40680389cd3ac744fa01640",
      "minted": 1 * 50
  },
  {
      "minter": "0xfd4ea5ec9ca35e1c7269f473ba14d6e73079d8d5",
      "minted": 12 * 50
  },
  {
      "minter": "0xb72c0bd8e68de7de2bf99abe238ad7d18f9daaf7",
      "minted": 7 * 50
  },
  {
      "minter": "0x5ff1a956284be4e6342aafa92f39fad65ac1acf8",
      "minted": 14 * 50
  },
  {
    "minter": "0x6177c71d568960d87e958c38000350ed3276796b",
    "minted": 2 * 50
  },
  {
      "minter": "0x6dac62e20f3c62819e98148bd346e44506778024",
      "minted": 2 * 50
  },
  {
      "minter": "0x780793b97d3dbb3f573e1ad123a082c0d53e32f4",
      "minted": 3 * 50
  },
  {
      "minter": "0x21258055dfd7a287dcc224e3586210f1864c1996",
      "minted": 3 * 50
  },
  {
      "minter": "0x76490bd39ec9a0fe14015608d594725bb9dd5829",
      "minted": 3 * 50
  },
  {
      "minter": "0xb81a7cc5af4acb0294ee124b5ad01d8d46e80cf7",
      "minted": 3 * 50
  },
  {
      "minter": "0x4753230b11e9fb0ae585925e020ea3fe35331e7e",
      "minted": 1 * 50
  },
  {
      "minter": "0x48151d601741d3f36ee73c19c0bacf121170c0d2",
      "minted": 1 * 50
  },
  {
      "minter": "0x987deb5a31c239deddb1a40165ad39c1c449962e",
      "minted": 2 * 50
  },
  {
      "minter": "0x6fa0ce4dc4e677c65aac9e4cb56d02b57820777d",
      "minted": 1 * 50
  },
  {
      "minter": "0x7e7a3a719c0a2a9a5b9c7cee320bdf0088f9924e",
      "minted": 1 * 50
  },
  {
      "minter": "0x62b4728c3cef6541ecf4bf41e61a7c1378cae631",
      "minted": 50 * 50
  },
  {
      "minter": "0x643f8c22c2fadc3948146456c11fbb135da62738",
      "minted": 1 * 50
  },
  {
      "minter": "0x8eb071957c416384bb9418cf5956279657bb3a14",
      "minted": 1 * 50
  },
  {
      "minter": "0xb1018c09c81a2e4d66dee7720e24399bd5ce124a",
      "minted": 10 * 50
  },
  {
      "minter": "0x26da08a06817789172b860ae77799df0a77461aa",
      "minted": 2 * 50
  },
  {
      "minter": "0xdd66525f4ab14f2044e39d84bcf51ef2463b86ae",
      "minted": 1 * 50
  },
  {
      "minter": "0x3f2571131e593e1e324ad4d57ad17f1b6bbd0014",
      "minted": 1 * 50
  },
  {
      "minter": "0x1611cad092c8744ce2361a64273ec1cc049e825c",
      "minted": 100 * 50
  },
  {
      "minter": "0x019a3b63aeb80526c09939d5d33902970b92fd9c",
      "minted": 29 * 50
  }
]

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );

const DAI_ADDRESS = "0xEf977d2f931C1978Db5F6747666fa1eACB0d0339";

module.exports = DeployFonduePot();

// eslint-disable-next-line no-use-before-define
// module.exports = async function ({getNamedAccounts, deployments}) {
//     const { deployer, alice, bob } = await getNamedAccounts();
//     // get signers
//     const [d, a, b] = await ethers.getSigners();

//     const gasPrice = (await d.provider.getGasPrice());

//     const ACTIVE = deployer;

//     // getContractAt IUniswapV2Router02 router contract
//     const router = await ethers.getContractAt("IUniswapV2Router02", "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", d);
//     const SLP = await ethers.getContractAt("IUniswapV2Pair", "0x40ab5B3D82E19Fd63b07cE6EB92E38eB3129ac7D", d);

//     const TICKETS = await ethers.getContract("FondueTicketsV2", "0x8C96d524b837feb90bA846F301071fcd42132a61");

//     const allBals = [
//       {
//           "minter": "0xef21e7c9fcbf76e1741e836f6c2879504549b3dc",
//           "minted": 150
//       },
//       {
//           "minter": "0x572c9cfb29746615f67dedd38f7daabd8addcbd1",
//           "minted": 50
//       },
//       {
//           "minter": "0x334dc1d8f223ba692449f1a4ea07d1d36c335125",
//           "minted": 50
//       },
//       {
//           "minter": "0xd40fc0beb479479b8beccac3196996e1e3cbb610",
//           "minted": 0
//       },
//       {
//           "minter": "0xf9911e360c6e5e3e1699a3a828c493136f25c63c",
//           "minted": 50
//       },
//       {
//           "minter": "0x692b01518dc87b8eaa3906147423e9941492726c",
//           "minted": 99
//       },
//       {
//           "minter": "0x8495ccacba569f3dc40680389cd3ac744fa01640",
//           "minted": 50
//       },
//       {
//           "minter": "0xfd4ea5ec9ca35e1c7269f473ba14d6e73079d8d5",
//           "minted": 600
//       },
//       {
//           "minter": "0xb72c0bd8e68de7de2bf99abe238ad7d18f9daaf7",
//           "minted": 1855
//       },
//       {
//           "minter": "0x5ff1a956284be4e6342aafa92f39fad65ac1acf8",
//           "minted": 700
//       },
//       {
//           "minter": "0x6177c71d568960d87e958c38000350ed3276796b",
//           "minted": 100
//       },
//       {
//           "minter": "0x6dac62e20f3c62819e98148bd346e44506778024",
//           "minted": 100
//       },
//       {
//           "minter": "0x780793b97d3dbb3f573e1ad123a082c0d53e32f4",
//           "minted": 100
//       },
//       {
//           "minter": "0x21258055dfd7a287dcc224e3586210f1864c1996",
//           "minted": 149
//       },
//       {
//           "minter": "0x76490bd39ec9a0fe14015608d594725bb9dd5829",
//           "minted": 150
//       },
//       {
//           "minter": "0xb81a7cc5af4acb0294ee124b5ad01d8d46e80cf7",
//           "minted": 149
//       },
//       {
//           "minter": "0x4753230b11e9fb0ae585925e020ea3fe35331e7e",
//           "minted": 50
//       },
//       {
//           "minter": "0x48151d601741d3f36ee73c19c0bacf121170c0d2",
//           "minted": 48
//       },
//       {
//           "minter": "0x987deb5a31c239deddb1a40165ad39c1c449962e",
//           "minted": 100
//       },
//       {
//           "minter": "0x6fa0ce4dc4e677c65aac9e4cb56d02b57820777d",
//           "minted": 0
//       },
//       {
//           "minter": "0x7e7a3a719c0a2a9a5b9c7cee320bdf0088f9924e",
//           "minted": 50
//       },
//       {
//           "minter": "0x62b4728c3cef6541ecf4bf41e61a7c1378cae631",
//           "minted": 2300
//       },
//       {
//           "minter": "0x643f8c22c2fadc3948146456c11fbb135da62738",
//           "minted": 50
//       },
//       {
//           "minter": "0x8eb071957c416384bb9418cf5956279657bb3a14",
//           "minted": 50
//       },
//       {
//           "minter": "0xb1018c09c81a2e4d66dee7720e24399bd5ce124a",
//           "minted": 499
//       },
//       {
//           "minter": "0x26da08a06817789172b860ae77799df0a77461aa",
//           "minted": 100
//       },
//       {
//           "minter": "0xdd66525f4ab14f2044e39d84bcf51ef2463b86ae",
//           "minted": 50
//       },
//       {
//           "minter": "0x3f2571131e593e1e324ad4d57ad17f1b6bbd0014",
//           "minted": 50
//       },
//       {
//           "minter": "0x1611cad092c8744ce2361a64273ec1cc049e825c",
//           "minted": 5000
//       },
//       {
//           "minter": "0x019a3b63aeb80526c09939d5d33902970b92fd9c",
//           "minted": 1449
//       },
//       {
//           "minter": "0x8c9ff72d37f753f5dd6b6e32d768bdc04a7ec84e",
//           "minted": 4
//       },
//       {
//           "minter": "0xfe22ec26206fdb905aebe4973192c437dd28a950",
//           "minted": 0
//       },
//       {
//           "minter": "0x09eed304f7cbd08e06cd7829f7dda2ca54e6350d",
//           "minted": 2600
//       },
//       {
//           "minter": "0x34cf360f0a33c524c0187fd0002d09df4b42b080",
//           "minted": 150
//       },
//       {
//           "minter": "0x3193810534ef55f1caf1d877fc2886675d7bf396",
//           "minted": 100
//       },
//       {
//           "minter": "0x9ab596c93253d4f9a1c0064c830035e8f764ccc2",
//           "minted": 1689
//       },
//       {
//           "minter": "0x6b5355a13b87d4e9eceb387d9abba7364e625abf",
//           "minted": 90
//       }
//   ];

//     Promise.all([...allBals.map(i => i.minter), ])



//     // let og_minters = allBals.map(b => {return {minter: b.addr, minted: b.bal}});
    
//     // // log uniswap pair liquidity reserves
//     // const reserves = await SLP.getReserves();
//     // console.log(`reserves: ${reserves.toString()}`);

// }

module.exports.tags = ["TheFondueMicePot", "DummyTickets"];

function DeployFonduePot() {
  return async ({
    getNamedAccounts, deployments,
  }) => {
    const { deploy } = deployments;
    const { deployer, alice, bob } = await getNamedAccounts();
    // get signers
    const [d, a, b] = await ethers.getSigners();

    const gasPrice = (await d.provider.getGasPrice());

    const ACTIVE = deployer;


    // const FakeDAI = await DeployScript("FakeDAI", []);
    console.log("sent funds to 0xb72");

    console.log('alice', ACTIVE);

    const allBals = [
      {
          "minter": "0xef21e7c9fcbf76e1741e836f6c2879504549b3dc",
          "minted": 150
      },
      {
          "minter": "0x572c9cfb29746615f67dedd38f7daabd8addcbd1",
          "minted": 50
      },
      {
          "minter": "0x334dc1d8f223ba692449f1a4ea07d1d36c335125",
          "minted": 50
      },
      {
          "minter": "0xd40fc0beb479479b8beccac3196996e1e3cbb610",
          "minted": 0
      },
      {
          "minter": "0xf9911e360c6e5e3e1699a3a828c493136f25c63c",
          "minted": 50
      },
      {
          "minter": "0x692b01518dc87b8eaa3906147423e9941492726c",
          "minted": 99
      },
      {
          "minter": "0x8495ccacba569f3dc40680389cd3ac744fa01640",
          "minted": 50
      },
      {
          "minter": "0xfd4ea5ec9ca35e1c7269f473ba14d6e73079d8d5",
          "minted": 600
      },
      {
          "minter": "0xb72c0bd8e68de7de2bf99abe238ad7d18f9daaf7",
          "minted": 1855
      },
      {
          "minter": "0x5ff1a956284be4e6342aafa92f39fad65ac1acf8",
          "minted": 700
      },
      {
          "minter": "0x6177c71d568960d87e958c38000350ed3276796b",
          "minted": 100
      },
      {
          "minter": "0x6dac62e20f3c62819e98148bd346e44506778024",
          "minted": 100
      },
      {
          "minter": "0x780793b97d3dbb3f573e1ad123a082c0d53e32f4",
          "minted": 100
      },
      {
          "minter": "0x21258055dfd7a287dcc224e3586210f1864c1996",
          "minted": 149
      },
      {
          "minter": "0x76490bd39ec9a0fe14015608d594725bb9dd5829",
          "minted": 150
      },
      {
          "minter": "0xb81a7cc5af4acb0294ee124b5ad01d8d46e80cf7",
          "minted": 149
      },
      {
          "minter": "0x4753230b11e9fb0ae585925e020ea3fe35331e7e",
          "minted": 50
      },
      {
          "minter": "0x48151d601741d3f36ee73c19c0bacf121170c0d2",
          "minted": 48
      },
      {
          "minter": "0x987deb5a31c239deddb1a40165ad39c1c449962e",
          "minted": 100
      },
      {
          "minter": "0x6fa0ce4dc4e677c65aac9e4cb56d02b57820777d",
          "minted": 0
      },
      {
          "minter": "0x7e7a3a719c0a2a9a5b9c7cee320bdf0088f9924e",
          "minted": 50
      },
      {
          "minter": "0x62b4728c3cef6541ecf4bf41e61a7c1378cae631",
          "minted": 2300
      },
      {
          "minter": "0x643f8c22c2fadc3948146456c11fbb135da62738",
          "minted": 50
      },
      {
          "minter": "0x8eb071957c416384bb9418cf5956279657bb3a14",
          "minted": 50
      },
      {
          "minter": "0xb1018c09c81a2e4d66dee7720e24399bd5ce124a",
          "minted": 499
      },
      {
          "minter": "0x26da08a06817789172b860ae77799df0a77461aa",
          "minted": 100
      },
      {
          "minter": "0xdd66525f4ab14f2044e39d84bcf51ef2463b86ae",
          "minted": 50
      },
      {
          "minter": "0x3f2571131e593e1e324ad4d57ad17f1b6bbd0014",
          "minted": 50
      },
      {
          "minter": "0x1611cad092c8744ce2361a64273ec1cc049e825c",
          "minted": 5000
      },
      {
          "minter": "0x019a3b63aeb80526c09939d5d33902970b92fd9c",
          "minted": 1449
      },
      {
          "minter": "0x8c9ff72d37f753f5dd6b6e32d768bdc04a7ec84e",
          "minted": 4
      },
      {
          "minter": "0xfe22ec26206fdb905aebe4973192c437dd28a950",
          "minted": 0
      },
      {
          "minter": "0x09eed304f7cbd08e06cd7829f7dda2ca54e6350d",
          "minted": 2600
      },
      {
          "minter": "0x34cf360f0a33c524c0187fd0002d09df4b42b080",
          "minted": 150
      },
      {
          "minter": "0x3193810534ef55f1caf1d877fc2886675d7bf396",
          "minted": 100
      },
      {
          "minter": "0x9ab596c93253d4f9a1c0064c830035e8f764ccc2",
          "minted": 1689
      },
      {
          "minter": "0x6b5355a13b87d4e9eceb387d9abba7364e625abf",
          "minted": 90
      }
  ];

    // const Dummy = await DeployScript("Dummy", [], d);
    // await Dummy.test().then(console.log)
    // const FondueTicketsV2 = await DeployScript("FondueTicketsV2", [allBals], d);
    // console.log("post deploy");

    // // console.log(`Deployed DummyTickets contract @ ${FondueTicketsV2.address}`);
    const TheFondueMicePot = await ethers.getContractAt("TheFondueMicePot", "0xC70Fb72fd243d8bbA8b48C877F3DCe1632F653a0");
    // await TheFondueMicePot.connect(d).grantRole("0x6a326ab1", deployer, {
    //   gasPrice,
    //   gasLimit: 1000000
    // }).then(x => x.wait? x.wait(1): x).then(console.log);
    // console.log("granted role")
    await TheFondueMicePot.connect(d).setPaymentToken("0x3F28e4F1f98CE3cE67AcC38cb142f0098D09FE25", {
      gasLimit: 2000000,
      gasPrice,
    }).then(x => x.wait? x.wait(1): x).then(console.log);
    // console.log("Set mouse pot!");
    // await new Promise((resolve) => setTimeout(resolve, 5000));

    // await FondueTicketsV2.SetOpen({
    //   gasLimit: 2000000,
    //   gasPrice
    // }).then(x => x.wait ? x.wait(1) : x).then( x => console.log("Set open!", x));



    async function DeployScript(script, args, signer) {
      console.log("GAS", Math.floor(gasPrice.toNumber() * 1.4), ACTIVE);
      return deploy(script, {
        from: ACTIVE,
        gasPrice: 69682252089 * 2,
        nonce: await d.provider.getTransactionCount(ACTIVE),
        args,
      }).then(async (instance) => {
        console.log(`Deployed ${script} contract @ ${instance.address}`);
        const contract = new ethers.Contract(instance.address, instance.abi);
        return contract.connect(signer);
      });
    }

  };
}

function DeployFondueTickets() {
  return async ({
    getNamedAccounts, deployments,
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
    const deployerNonce = await d.provider.getTransactionCount(deployer);

    /* DEPLOY 👇 */
    // deploy Test1155 as nft contract
    // const Test1155 = await deploy("Test1155", {
    //   from: deployer,
    //   gasPrice: gasPrice.toNumber() * 2,
    //   args: [TestAddresses[0]],
    //   nonce: deployerNonce,
    // });
    // console.log(`Deployed Test1155 contract @ ${Test1155.address}`);
    // deployerNonce = await d.provider.getTransactionCount(deployer);
    // deploy FondueTickets.sol
    const FondueTickets = await deploy("FondueTickets", {
      from: deployer,
      gasPrice,
      nonce: deployerNonce,
      args: [block.number],
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
}

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
