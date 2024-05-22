// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "./Parameters.sol";
import { ERC20Mock } from "./Mocks/ERC20Mock.sol";

contract RouterConfig is Script, Parameters {
    struct Token {
        address wbtc;
        address weth;
        address link;
        address avax;
        address uni;
        address usdc;
        address usdt;
    }

    function run() external view returns (Token memory token){
        if (block.chainid == AVALANCHE_FUJI_CHAIN_ID) {
            return getAvalancheFujiToken();
        }
        else if (block.chainid == ETHEREUM_SEPOLIA_CHAIN_ID) {
            return getEthereumSepoliaToken();
        }
        else if (block.chainid == ARBITRUM_SEPOLIA_CHAIN_ID) {
            return getArbitrumSepoliaToken();
        }
        else if (block.chainid == POLYGON_AMOY_CHAIN_ID) {
            return getPolygonAmoyToken();
        }
        else if (block.chainid == BASE_SEPOLIA_CHAIN_ID) {
            return getBaseSepoliaToken();
        }
        else if (block.chainid == OPTIMISM_SEPOLIA_CHAIN_ID) {
            return getOptimismSepoliaToken();
        }
    }

    function getAvalancheFujiToken() internal pure returns (Token memory token){
        token.wbtc = AVALANCHE_FUJI_WBTC;
        token.weth = AVALANCHE_FUJI_WETH;
        token.link = AVALANCHE_FUJI_LINK;
        token.avax = AVALANCHE_FUJI_AVAX;
        token.uni = AVALANCHE_FUJI_UNI;
        token.usdc = AVALANCHE_FUJI_USDC;
        token.usdt = AVALANCHE_FUJI_USDT;
    }

    function getEthereumSepoliaToken() internal pure returns (Token memory token){
        token.wbtc = ETHEREUM_SEPOLIA_WBTC;
        token.weth = ETHEREUM_SEPOLIA_WETH;
        token.link = ETHEREUM_SEPOLIA_LINK;
        token.avax = ETHEREUM_SEPOLIA_AVAX;
        token.uni = ETHEREUM_SEPOLIA_UNI;
        token.usdc = ETHEREUM_SEPOLIA_USDC;
        token.usdt = ETHEREUM_SEPOLIA_USDT;
    }

    function getArbitrumSepoliaToken() internal pure returns (Token memory token){
        token.wbtc = ARBITRUM_SEPOLIA_WBTC;
        token.weth = ARBITRUM_SEPOLIA_WETH;
        token.link = ARBITRUM_SEPOLIA_LINK;
        token.avax = ARBITRUM_SEPOLIA_AVAX;
        token.uni = ARBITRUM_SEPOLIA_UNI;
        token.usdc = ARBITRUM_SEPOLIA_USDC;
        token.usdt = ARBITRUM_SEPOLIA_USDT;
    }

    function getPolygonAmoyToken() internal pure returns (Token memory token){
        token.wbtc = POLYGON_AMOY_WBTC;
        token.weth = POLYGON_AMOY_WETH;
        token.link = POLYGON_AMOY_LINK;
        token.avax = POLYGON_AMOY_AVAX;
        token.uni = POLYGON_AMOY_UNI;
        token.usdc = POLYGON_AMOY_USDC;
        token.usdt = POLYGON_AMOY_USDT;
    }

    function getBaseSepoliaToken() internal pure returns (Token memory token){
        token.wbtc = BASE_SEPOLIA_WBTC;
        token.weth = BASE_SEPOLIA_WETH;
        token.link = BASE_SEPOLIA_LINK;
        token.avax = BASE_SEPOLIA_AVAX;
        token.uni = BASE_SEPOLIA_UNI;
        token.usdc = BASE_SEPOLIA_USDC;
        token.usdt = BASE_SEPOLIA_USDT;
    }

    function getOptimismSepoliaToken() internal pure returns (Token memory token){
        token.wbtc = OPTIMISM_SEPOLIA_WBTC;
        token.weth = OPTIMISM_SEPOLIA_WETH;
        token.link = OPTIMISM_SEPOLIA_LINK;
        token.avax = OPTIMISM_SEPOLIA_AVAX;
        token.uni = OPTIMISM_SEPOLIA_UNI;
        token.usdc = OPTIMISM_SEPOLIA_USDC;
        token.usdt = OPTIMISM_SEPOLIA_USDT;
    }
}