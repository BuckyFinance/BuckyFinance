// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";

contract ChainConfig is Script, Parameters {
    struct ChainComponent {
        address depositor;
        address minter;
        uint64 chainSelector;
        address router;
    }

    function run() external view returns (ChainComponent memory chain) {
        if (block.chainid == AVALANCHE_FUJI_CHAIN_ID) {
            chain = getAvalancheFujiChain();
        }
        if (block.chainid == ETHEREUM_SEPOLIA_CHAIN_ID) {
            chain = getEthereumSepoliaChain();
        }
        if (block.chainid == ARBITRUM_SEPOLIA_CHAIN_ID) {
            chain = getArbitrumSepoliaChain();
        }
        if (block.chainid == POLYGON_AMOY_CHAIN_ID) {
            chain = getPolygonAmoyChain();
        }
        if (block.chainid == BASE_SEPOLIA_CHAIN_ID) {
            chain = getBaseSepoliaChain();
        }
        if (block.chainid == OPTIMISM_SEPOLIA_CHAIN_ID) {
            chain = getOptimismSepoliaChain();
        }
    }

    function getAvalancheFujiChain() public pure returns (ChainComponent memory chain) {
        chain.depositor = AVALANCHE_FUJI_DEPOSITOR;
        chain.minter = AVALANCHE_FUJI_MINTER;
        chain.chainSelector = AVALANCHE_FUJI_CHAIN_SELECTOR;
        chain.router = AVALANCHE_FUJI_CCIP_ROUTER;
    }

    function getEthereumSepoliaChain() public pure returns (ChainComponent memory chain) {
        chain.depositor = ETHEREUM_SEPOLIA_DEPOSITOR;
        chain.minter = ETHEREUM_SEPOLIA_MINTER;
        chain.chainSelector = ETHEREUM_SEPOLIA_CHAIN_SELECTOR;
        chain.router = ETHEREUM_SEPOLIA_CCIP_ROUTER;
    }

    function getArbitrumSepoliaChain() public pure returns (ChainComponent memory chain) {
        chain.depositor = ARBITRUM_SEPOLIA_DEPOSITOR;
        chain.minter = ARBITRUM_SEPOLIA_MINTER;
        chain.chainSelector = ARBITRUM_SEPOLIA_CHAIN_SELECTOR;
        chain.router = ARBITRUM_SEPOLIA_CCIP_ROUTER;
    }

    function getPolygonAmoyChain() public pure returns (ChainComponent memory chain) {
        chain.depositor = POLYGON_AMOY_DEPOSITOR;
        chain.minter = POLYGON_AMOY_MINTER;
        chain.chainSelector = POLYGON_AMOY_CHAIN_SELECTOR;
        chain.router = POLYGON_AMOY_CCIP_ROUTER;
    }

    function getBaseSepoliaChain() public pure returns (ChainComponent memory chain) {
        chain.depositor = BASE_SEPOLIA_DEPOSITOR;
        chain.minter = BASE_SEPOLIA_MINTER;
        chain.chainSelector = BASE_SEPOLIA_CHAIN_SELECTOR;
        chain.router = BASE_SEPOLIA_CCIP_ROUTER;
    }

    function getOptimismSepoliaChain() public pure returns (ChainComponent memory chain) {
        chain.depositor = OPTIMISM_SEPOLIA_DEPOSITOR;
        chain.minter = OPTIMISM_SEPOLIA_MINTER;
        chain.chainSelector = OPTIMISM_SEPOLIA_CHAIN_SELECTOR;
        chain.router = OPTIMISM_SEPOLIA_CCIP_ROUTER;
    }


}