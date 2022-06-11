// staging test are run only on testnets (final stage of developing)
const { assert, expect } = require("chai")
const { deployments, ethers, network, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          // const sendValue = "1000000000000000000" // 1 ETH
          const sendValue = ethers.utils.parseEther("1")

          // before each "it"
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer) // returns the most recent deployment
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
      })
