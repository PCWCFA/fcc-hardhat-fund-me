const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
	experimentalAddHardhatNetworkMessageTraceHook,
} = require("hardhat/config");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async function () {
			let fundMe;
			let deployer;
			let mockV3Aggregator;
			const sendValue = ethers.utils.parseEther("1");

			beforeEach(async function () {
				// deployer is the account
				// const accounts = await eithers.getSingers();
				// const accountZero = accounts[0];
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(["all"]);
				fundMe = await ethers.getContract("FundMe", deployer);
				mockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer
				);
			});

			describe("constructor", async function () {
				it("sets the aggregator addresses correctly", async function () {
					const response = await fundMe.getPriceFeed();
					assert.equal(response, mockV3Aggregator.address);
				});
			});

			describe("fund", async function () {
				it("eth sent is less than the min usd value", async function () {
					await expect(fundMe.fund()).to.be.revertedWith("");
				});

				it("update the amount funded data structure", async function () {
					await fundMe.fund({ value: sendValue });
					const response = await fundMe.getAddressToAmountFunded(deployer);
					assert.equal(response.toString(), sendValue.toString());
				});

				it("add funder to an array of getFunder", async function () {
					await fundMe.fund({ value: sendValue });
					const funder = await fundMe.getFunder(0);
					assert.equal(funder, deployer);
				});
			});

			describe("withdraw", async function () {
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue });
				});

				it("withdraw ETH from a single funder", async function () {
					// arrange
					const startingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const startingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);
					// act
					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt = await transactionResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = transactionReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);

					const endingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const endingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);
					// assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance.add(startingDeployerBalance).toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
				});

				it("allows us to withdraw with multiple getFunder", async function () {
					const accounts = await ethers.getSigners();

					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(accounts[i]);
						await fundMeConnectedContract.fund({ value: sendValue });
					}
					const startingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const startingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);

					// Act
					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt = await transactionResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = transactionReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);
					const endingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const endingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);
					// assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance.add(startingDeployerBalance).toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
					// Make sure the getFunder are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (let i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(accounts[i].address),
							0
						);
					}
				});

				it("only allows the owner to withdraw", async function () {
					const accounts = await ethers.getSigners();
					const attacker = accounts[1];
					const attackerConnectedContract = await fundMe.connect(attacker);
					await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
						"FundMe__NotOwner"
					);
				});

				it("cheaperWithdraw ETH from a single funder", async function () {
					// arrange
					const startingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const startingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);
					// act
					const transactionResponse = await fundMe.cheaperWithdraw();
					const transactionReceipt = await transactionResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = transactionReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);

					const endingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const endingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);
					// assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance.add(startingDeployerBalance).toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
				});

				it("cheaperWithdraw multi funders", async function () {
					const accounts = await ethers.getSigners();
					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(accounts[i]);
						await fundMeConnectedContract.fund({ value: sendValue });
					}
					const startingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const startingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);

					// Act
					const transactionResponse = await fundMe.cheaperWithdraw();
					const transactionReceipt = await transactionResponse.wait(1);
					const { gasUsed, effectiveGasPrice } = transactionReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);
					const endingFundMeBalance = await fundMe.provider.getBalance(
						fundMe.address
					);
					const endingDeployerBalance = await fundMe.provider.getBalance(
						deployer
					);
					// assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance.add(startingDeployerBalance).toString(),
						endingDeployerBalance.add(gasCost).toString()
					);
					// Make sure the getFunder are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (let i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(accounts[i].address),
							0
						);
					}
				});
			});
	  });
