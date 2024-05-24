// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";
import { MainRouter } from "../../src/MainRouter.sol";
import { ChainConfig } from "../config/ChainConfig.s.sol";
import { Parameters } from "../Parameters.sol";

contract Redeem is Script, Parameters {
    function redeem(uint64 _destinationChainSelector, address _receiver, address _token, uint256 _amount, uint256 _amountEther) external {
        MainRouter mainRouter = MainRouter(payable(AVALANCHE_FUJI_MAIN_ROUTER));

        vm.startBroadcast();
        mainRouter.redeem{value: _amountEther}(_destinationChainSelector, _receiver, _token, _amount);
        vm.stopBroadcast();
    }
}