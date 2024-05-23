// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";
import { Depositor } from "../../src/Depositor.sol";
import { ChainConfig } from "../config/ChainConfig.s.sol";

contract Deposit is Script {
    function deposit() external {
        ChainConfig config = new ChainConfig();
        ChainConfig.ChainComponent memory chain = config.run();

        TokenConfig tokenConfig = new TokenConfig();
        TokenConfig.Token memory token = tokenConfig.run();

        vm.startBroadcast();
        ERC20Mock(token.wbtc.token).approve(address(chain.depositor), 0.01 ether);
        Depositor(payable(chain.depositor)).deposit{value: 0.003 ether}(token.wbtc.token, 0.01 ether);
        vm.stopBroadcast();
    }
}