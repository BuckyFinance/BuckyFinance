// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { MainRouter } from "../../src/MainRouter.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";
import { CCIPBase } from "../../src/library/CCIPBase.sol";

contract SetAllowedSender is Script, Parameters {
    function setAllowedSender(address _contract, address _sender) external {
        vm.startBroadcast();
        CCIPBase _c = CCIPBase(_contract);
        _c.setAllowedSender(_sender, true);
        vm.stopBroadcast();
        
    }
}
