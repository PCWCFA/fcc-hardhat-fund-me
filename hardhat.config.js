require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
	// solidity: "0.8.8",
	solidity: {
		compilers: [
			{ version: "0.8.8" },
			{ version: "0.6.0" },
			{ version: "0.7.0" },
		],
	},
	defaultNetwork: "hardhat",
	networks: {
		rinkeby: {
			url: RINKEBY_RPC_URL,
			accounts: [RINKEBY_PRIVATE_KEY],
			chainId: 4,
			blockConfirmations: 6,
		},
	},
	gasReporter: {
		enabled: true,
		outputfile: "gas-report.txt",
		noColors: true,
		currency: "USD",
		coinmarketcap: COINMARKETCAP_API_KEY,
		token: "MATIC",
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
	},
};
