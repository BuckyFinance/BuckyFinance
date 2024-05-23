// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { MainRouter } from "../../src/MainRouter.sol";
import { Minter } from "../../src/Minter.sol";
import { ChainConfig } from "../config/ChainConfig.s.sol";

contract DeployMinter is Script, Parameters {
    function run() external returns (Minter minter) {
        ChainConfig config = new ChainConfig();
        address router = config.run().router;
        vm.startBroadcast();
        minter = new Minter(router, AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_MAIN_ROUTER);
        
        minter.setAllowedDestinationChain(AVALANCHE_FUJI_CHAIN_SELECTOR, true);
        minter.setAllowedSourceChain(AVALANCHE_FUJI_CHAIN_SELECTOR, true);
        minter.setAllowedSender(AVALANCHE_FUJI_MAIN_ROUTER, true);

        vm.stopBroadcast();
    }
}