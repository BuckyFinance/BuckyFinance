// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "./Parameters.sol";
import { MainRouter } from "../src/MainRouter.sol";
import { Depositor } from "../src/Depositor.sol";
import { RouterConfig } from "./RouterConfig.s.sol";

contract Deployer is Script, Parameters {
    function run() external returns (Depositor depositor) {
        RouterConfig config = new RouterConfig();
        address router = config.run();
        vm.startBroadcast();
        depositor = new Depositor(router, AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_MAIN_ROUTER);
        vm.stopBroadcast();
    }
}