// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";

contract DeployTokens is Script {
    struct Token {
        ERC20Mock wbtc;
        ERC20Mock weth;
        ERC20Mock link;
        ERC20Mock avax;
        ERC20Mock uni;
        ERC20Mock usdc;
        ERC20Mock usdt;
    }

    function run() external returns(Token memory token){
        address owner = vm.envAddress("OWNER_ADDRESS");
        vm.startBroadcast();
        token.wbtc = new ERC20Mock("Wrapped Bitcoin", "WBTC", 18, owner, 100e18);
        token.weth = new ERC20Mock("Wrapped Ether", "WETH", 18, owner, 100e18);
        token.link = new ERC20Mock("Chainlink", "LINK", 18, owner, 1000e18);
        token.avax = new ERC20Mock("Avalanche", "AVAX", 18, owner, 1000e18);
        token.uni = new ERC20Mock("Uniswap", "UNI", 18, owner, 1000e18);
        token.usdc = new ERC20Mock("USD Coin", "USDC", 6, owner, 1000000e6);
        token.usdt = new ERC20Mock("Tether", "USDT", 6, owner, 1000000e6);
        vm.stopBroadcast();
    }
}