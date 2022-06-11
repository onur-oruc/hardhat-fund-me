// reference: https://github.com/PatrickAlphaC/hardhat-fund-me-fcc/blob/main/test/unit/FundMe.test.js
const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", function () {
    let fundMe
    let mockV3Aggregator
    let deployer, user
    // const sendValue = "1000000000000000000" // 1 ETH
    const sendValue = ethers.utils.parseEther("1")

    // before each "it"
    beforeEach(async function () {
        await deployments.fixture(["all"]) // run through all the contracts that has "all" tag
        // we can deploy everthing which is under the
        // deploy folder
        deployer = (await getNamedAccounts()).deployer
        user = (await getNamedAccounts()).user
        fundMe = await ethers.getContract("FundMe", deployer) // returns the most recent deployment
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("fails if not ETH is sent", async function () {
            // await expect(fundMe.fund()).to.be.reverted;
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("updates the amount funded data structure funded by deployer", async function () {
            await fundMe.fund({ value: sendValue })
            const fundedAmount = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(fundedAmount.toString(), sendValue.toString())
        })
        it("adds funder to the array of funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })
    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraws ETH from a single founder", async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // withdraw
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // get gas cost
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), // BigNumber.add
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("withdraws ETH from a single founder with cheaperWithdraw", async function () {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // withdraw
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // get gas cost
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(), // BigNumber.add
                endingDeployerBalance.add(gasCost).toString()
            )
        })
    })
})
