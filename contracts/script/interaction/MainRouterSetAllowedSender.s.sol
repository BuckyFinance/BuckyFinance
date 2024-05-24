// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { MainRouter } from "../../src/MainRouter.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";

contract SetAllowedSender is Script, Parameters {
    function setAllowedSender(address _sender) external {
        vm.startBroadcast();
        MainRouter mainRouter = MainRouter(payable(AVALANCHE_FUJI_MAIN_ROUTER));
        mainRouter.setAllowedSender(_sender, true);
        vm.stopBroadcast();
        
    }
}
