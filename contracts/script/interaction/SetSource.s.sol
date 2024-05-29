// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { MainRouter } from "../../src/MainRouter.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";

contract SetSource is Script, Parameters {
    function run() external {
        MainRouter mainRouter = MainRouter(payable(AVALANCHE_FUJI_MAIN_ROUTER));
        vm.startBroadcast();
        mainRouter.setSource("const user = args[0];const apiResponse = await Functions.makeHttpRequest({url: `https://beta.credprotocol.com/api/score/address/${user}/`,headers: {'Authorization': `Token 6fe5fdf3a2f2d3327bd864fe3d3017a610b7c488`},});if (apiResponse.error) {throw Error('Request failed');}const { data } = apiResponse;return Functions.encodeUint256(data.value);");
        vm.stopBroadcast();
        
    }
}
