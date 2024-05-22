// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "./Parameters.sol";
import { MainRouter } from "../src/MainRouter.sol";


contract Deployer is Script, Parameters {
    function run() external returns (MainRouter mainRouter) {
        vm.startBroadcast();
        mainRouter = new MainRouter(AVALANCHE_FUJI_CCIP_ROUTER, AVALANCHE_FUJI_FUNCTIONS_ROUTER, AVALANCHE_FUJI_DON_ID);
        vm.stopBroadcast();
    }
}