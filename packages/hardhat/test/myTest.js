const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("The Fondue Pot", function () {
  let fonduePot;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("FonduePot", function () {
    it("Should deploy FonduePot", async function () {
      const FonduePot = await ethers.getContractFactory("FonduePot");

      fonduePot = await FonduePot.deploy();
    });
  });
});
