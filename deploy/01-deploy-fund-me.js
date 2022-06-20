const { getNamedAccounts, deployments, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments; // these are functions
	// get named accounts instead of using ethers.js accounts[0]
	const { deployer } = await getNamedAccounts();

	const chainId = network.config.chainId;
	let ethUsdPriceFeedAddress;

	console.log("chainId", chainId, "network configs", networkConfig[chainId]);

	// make the address network dependent
	if (chainId == 31337) {
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	// When going for hardhat or locallost, we want to use a mock.
	const args = [ethUsdPriceFeedAddress];
	console.log("args", args);
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: args, // put price feed address
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	// Verify if not on the local HH chain.
	if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
		await verify(fundMe.address, args);
	}
};

module.exports.tags = ["all", "fundme"];
