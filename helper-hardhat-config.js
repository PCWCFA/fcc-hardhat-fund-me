const networkConfig = {
	4: {
		name: "rinkeby",
		ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
	},
	137: {
		name: "polygon",
		// Note that I put in the Mumbai Test Net
		ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
	},
	// 31337
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
	networkConfig,
	developmentChains,
};
