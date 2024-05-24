// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { MainRouter } from "../../src/MainRouter.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";

contract SetAvalanche is Script, Parameters {
    function run() external {
        MainRouter mainRouter = MainRouter(payable(AVALANCHE_FUJI_MAIN_ROUTER));
        vm.startBroadcast();
        mainRouter.setAvalancheDepositor(AVALANCHE_FUJI_DEPOSITOR);
        mainRouter.setAvalancheMinter(AVALANCHE_FUJI_MINTER);
        vm.stopBroadcast();
        
    }
}
