// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";

contract TokenConfig is Script, Parameters {
    struct BaseToken {
        uint64 chainSelector;
        address token;
        address priceFeed;
    }

    struct Token {
        BaseToken wbtc;
        BaseToken weth;
        BaseToken link;
        BaseToken avax;
        BaseToken uni;
        BaseToken usdc;
        BaseToken usdt;
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

    function getAvalancheFujiToken() public pure returns (Token memory token){
        token.wbtc = BaseToken(AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_WBTC, BTC_PRICE_FEED);
        token.weth = BaseToken(AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_WETH, ETH_PRICE_FEED);
        token.link = BaseToken(AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_LINK, LINK_PRICE_FEED);
        token.avax = BaseToken(AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_AVAX, AVAX_PRICE_FEED);
        token.uni = BaseToken(AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_UNI, UNI_PRICE_FEED);
        token.usdc = BaseToken(AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_USDC, USDC_PRICE_FEED);
        token.usdt = BaseToken(AVALANCHE_FUJI_CHAIN_SELECTOR, AVALANCHE_FUJI_USDT, USDT_PRICE_FEED);
    }

    function getEthereumSepoliaToken() public pure returns (Token memory token){
        token.wbtc = BaseToken(ETHEREUM_SEPOLIA_CHAIN_SELECTOR, ETHEREUM_SEPOLIA_WBTC, BTC_PRICE_FEED);
        token.weth = BaseToken(ETHEREUM_SEPOLIA_CHAIN_SELECTOR, ETHEREUM_SEPOLIA_WETH, ETH_PRICE_FEED);
        token.link = BaseToken(ETHEREUM_SEPOLIA_CHAIN_SELECTOR, ETHEREUM_SEPOLIA_LINK, LINK_PRICE_FEED);
        token.avax = BaseToken(ETHEREUM_SEPOLIA_CHAIN_SELECTOR, ETHEREUM_SEPOLIA_AVAX, AVAX_PRICE_FEED);
        token.uni = BaseToken(ETHEREUM_SEPOLIA_CHAIN_SELECTOR, ETHEREUM_SEPOLIA_UNI, UNI_PRICE_FEED);
        token.usdc = BaseToken(ETHEREUM_SEPOLIA_CHAIN_SELECTOR, ETHEREUM_SEPOLIA_USDC, USDC_PRICE_FEED);
        token.usdt = BaseToken(ETHEREUM_SEPOLIA_CHAIN_SELECTOR, ETHEREUM_SEPOLIA_USDT, USDT_PRICE_FEED);
    }

    function getArbitrumSepoliaToken() public pure returns (Token memory token){
        token.wbtc = BaseToken(ARBITRUM_SEPOLIA_CHAIN_SELECTOR, ARBITRUM_SEPOLIA_WBTC, BTC_PRICE_FEED);
        token.weth = BaseToken(ARBITRUM_SEPOLIA_CHAIN_SELECTOR, ARBITRUM_SEPOLIA_WETH, ETH_PRICE_FEED);
        token.link = BaseToken(ARBITRUM_SEPOLIA_CHAIN_SELECTOR, ARBITRUM_SEPOLIA_LINK, LINK_PRICE_FEED);
        token.avax = BaseToken(ARBITRUM_SEPOLIA_CHAIN_SELECTOR, ARBITRUM_SEPOLIA_AVAX, AVAX_PRICE_FEED);
        token.uni = BaseToken(ARBITRUM_SEPOLIA_CHAIN_SELECTOR, ARBITRUM_SEPOLIA_UNI, UNI_PRICE_FEED);
        token.usdc = BaseToken(ARBITRUM_SEPOLIA_CHAIN_SELECTOR, ARBITRUM_SEPOLIA_USDC, USDC_PRICE_FEED);
        token.usdt = BaseToken(ARBITRUM_SEPOLIA_CHAIN_SELECTOR, ARBITRUM_SEPOLIA_USDT, USDT_PRICE_FEED);
    }

    function getPolygonAmoyToken() public pure returns (Token memory token){
        token.wbtc = BaseToken(POLYGON_AMOY_CHAIN_SELECTOR, POLYGON_AMOY_WBTC, BTC_PRICE_FEED);
        token.weth = BaseToken(POLYGON_AMOY_CHAIN_SELECTOR, POLYGON_AMOY_WETH, ETH_PRICE_FEED);
        token.link = BaseToken(POLYGON_AMOY_CHAIN_SELECTOR, POLYGON_AMOY_LINK, LINK_PRICE_FEED);
        token.avax = BaseToken(POLYGON_AMOY_CHAIN_SELECTOR, POLYGON_AMOY_AVAX, AVAX_PRICE_FEED);
        token.uni = BaseToken(POLYGON_AMOY_CHAIN_SELECTOR, POLYGON_AMOY_UNI, UNI_PRICE_FEED);
        token.usdc = BaseToken(POLYGON_AMOY_CHAIN_SELECTOR, POLYGON_AMOY_USDC, USDC_PRICE_FEED);
        token.usdt = BaseToken(POLYGON_AMOY_CHAIN_SELECTOR, POLYGON_AMOY_USDT, USDT_PRICE_FEED);
    }

    function getBaseSepoliaToken() public pure returns (Token memory token){
        token.wbtc = BaseToken(BASE_SEPOLIA_CHAIN_SELECTOR, BASE_SEPOLIA_WBTC, BTC_PRICE_FEED);
        token.weth = BaseToken(BASE_SEPOLIA_CHAIN_SELECTOR, BASE_SEPOLIA_WETH, ETH_PRICE_FEED);
        token.link = BaseToken(BASE_SEPOLIA_CHAIN_SELECTOR, BASE_SEPOLIA_LINK, LINK_PRICE_FEED);
        token.avax = BaseToken(BASE_SEPOLIA_CHAIN_SELECTOR, BASE_SEPOLIA_AVAX, AVAX_PRICE_FEED);
        token.uni = BaseToken(BASE_SEPOLIA_CHAIN_SELECTOR, BASE_SEPOLIA_UNI, UNI_PRICE_FEED);
        token.usdc = BaseToken(BASE_SEPOLIA_CHAIN_SELECTOR, BASE_SEPOLIA_USDC, USDC_PRICE_FEED);
        token.usdt = BaseToken(BASE_SEPOLIA_CHAIN_SELECTOR, BASE_SEPOLIA_USDT, USDT_PRICE_FEED);
    }

    function getOptimismSepoliaToken() public pure returns (Token memory token){
        token.wbtc = BaseToken(OPTIMISM_SEPOLIA_CHAIN_SELECTOR, OPTIMISM_SEPOLIA_WBTC, BTC_PRICE_FEED);
        token.weth = BaseToken(OPTIMISM_SEPOLIA_CHAIN_SELECTOR, OPTIMISM_SEPOLIA_WETH, ETH_PRICE_FEED);
        token.link = BaseToken(OPTIMISM_SEPOLIA_CHAIN_SELECTOR, OPTIMISM_SEPOLIA_LINK, LINK_PRICE_FEED);
        token.avax = BaseToken(OPTIMISM_SEPOLIA_CHAIN_SELECTOR, OPTIMISM_SEPOLIA_AVAX, AVAX_PRICE_FEED);
        token.uni = BaseToken(OPTIMISM_SEPOLIA_CHAIN_SELECTOR, OPTIMISM_SEPOLIA_UNI, UNI_PRICE_FEED);
        token.usdc = BaseToken(OPTIMISM_SEPOLIA_CHAIN_SELECTOR, OPTIMISM_SEPOLIA_USDC, USDC_PRICE_FEED);
        token.usdt = BaseToken(OPTIMISM_SEPOLIA_CHAIN_SELECTOR, OPTIMISM_SEPOLIA_USDT, USDT_PRICE_FEED);
    }
}