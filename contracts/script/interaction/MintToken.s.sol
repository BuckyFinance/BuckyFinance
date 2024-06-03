// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";

contract MintToken is Script {
    function mintToken(address _user) external {
        TokenConfig tokenConfig = new TokenConfig();
        TokenConfig.Token memory token = tokenConfig.run();

        vm.startBroadcast();
        ERC20Mock(token.wbtc.token).mint(_user, 5 ether);
        ERC20Mock(token.weth.token).mint(_user, 20 ether);
        ERC20Mock(token.avax.token).mint(_user, 1000 ether);
        ERC20Mock(token.link.token).mint(_user, 1000 ether);
        ERC20Mock(token.uni.token).mint(_user, 1000 ether);
        ERC20Mock(token.usdt.token).mint(_user, 1e6 * 1e6);
        ERC20Mock(token.usdc.token).mint(_user, 1e6 * 1e6);
        vm.stopBroadcast();
    }
}