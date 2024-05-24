// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { MainRouter } from "../../src/MainRouter.sol";
import { TokenConfig } from "./TokenConfig.s.sol";

contract MainRouterConfig is Script, Parameters {
    function run() external {
        vm.startBroadcast();
        MainRouter mainRouter = MainRouter(payable(AVALANCHE_FUJI_MAIN_ROUTER));

        mainRouter.setAllowedSender(AVALANCHE_FUJI_DEPOSITOR, true);
        mainRouter.setAllowedSender(ETHEREUM_SEPOLIA_DEPOSITOR, true);
        mainRouter.setAllowedSender(POLYGON_AMOY_DEPOSITOR, true);
        mainRouter.setAllowedSender(BASE_SEPOLIA_DEPOSITOR, true);
        mainRouter.setAllowedSender(OPTIMISM_SEPOLIA_DEPOSITOR, true);
        mainRouter.setAllowedSender(ARBITRUM_SEPOLIA_DEPOSITOR, true);

        mainRouter.setAllowedSender(AVALANCHE_FUJI_MINTER, true);
        mainRouter.setAllowedSender(ETHEREUM_SEPOLIA_MINTER, true);
        mainRouter.setAllowedSender(POLYGON_AMOY_MINTER, true);
        mainRouter.setAllowedSender(BASE_SEPOLIA_MINTER, true);
        mainRouter.setAllowedSender(OPTIMISM_SEPOLIA_MINTER, true);
        mainRouter.setAllowedSender(ARBITRUM_SEPOLIA_MINTER, true);
        
        mainRouter.setAvalancheDepositor(AVALANCHE_FUJI_DEPOSITOR);
        mainRouter.setAvalancheMinter(AVALANCHE_FUJI_MINTER);
        
        vm.stopBroadcast();
        
    }
}
