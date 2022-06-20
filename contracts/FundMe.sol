//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__LessThanMinUSD();
error FundMe__WithdrawFailed();

/** @title A contract for crowd funding
 *  @author PCWCFA
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
	// Type declarations
	using PriceConverter for uint256;

	// State variables
	uint256 public constant MIN_USD = 50 * 1e18;
	address[] private s_funders;
	mapping(address => uint256) private s_addressToAmountFunded;
	address private immutable i_owner;
	AggregatorV3Interface private s_priceFeed;

	// Modifiers
	modifier onlyOwner() {
		//require (msg.sender == i_owner, "Only the owner can withdraw.");
		if (msg.sender != i_owner) {
			revert FundMe__NotOwner();
		}
		_; // The rest of the code. Ex: the Send function.
	}

	constructor(address priceFeedAddress) {
		i_owner = msg.sender; // This is so the deployer of the contract is the owner.
		s_priceFeed = AggregatorV3Interface(priceFeedAddress);
	}

	receive() external payable {
		fund();
	}

	fallback() external payable {
		fund();
	}

	/**
	 *  @notice This function funds this contract
	 *  @dev This implements price feeds as our library
	 */
	function fund() public payable {
		if (msg.value.getConversionRate(s_priceFeed) < MIN_USD) {
			revert FundMe__LessThanMinUSD();
		}
		s_funders.push(msg.sender);
		s_addressToAmountFunded[msg.sender] = msg.value;
	}

	function withdraw() public onlyOwner {
		for (uint256 i = 0; i < s_funders.length; i++) {
			s_addressToAmountFunded[s_funders[i]] = 0;
		}
		// This resets the array by declaring it anew with no objects (0).
		s_funders = new address[](0);

		// Using call which as of Dec-2019 is the preferred method.
		(
			bool callSuccess, /*bytes memory dataReturned*/

		) = payable(msg.sender).call{value: address(this).balance}("");
		if (!callSuccess) {
			revert FundMe__WithdrawFailed();
		}
	}

	function cheaperWithdraw() public onlyOwner {
		address[] memory funders = s_funders;

		for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
			address funder = funders[funderIndex];
			s_addressToAmountFunded[funder] = 0;
		}
		s_funders = new address[](0);
		(bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
		if (!callSuccess) {
			revert FundMe__WithdrawFailed();
		}
	}

	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getFunder(uint256 index) public view returns (address) {
		return s_funders[index];
	}

	function getAddressToAmountFunded(address funder)
		public
		view
		returns (uint256)
	{
		return s_addressToAmountFunded[funder];
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
		return s_priceFeed;
	}
}
