// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { MainRouter } from "../../src/MainRouter.sol";

contract GetCredit is Script, Parameters {
    function getCredit(address user, string[] calldata args) external returns(bytes32) {
        MainRouter mainRouter = MainRouter(payable(AVALANCHE_FUJI_MAIN_ROUTER));

        vm.startBroadcast();
        bytes32 mid = mainRouter.sendRequestToCalculateActivityCredit(user, args);
        vm.stopBroadcast();

        return mid;
    }
}