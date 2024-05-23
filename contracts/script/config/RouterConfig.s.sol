// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { Parameters } from "../Parameters.sol";

contract RouterConfig is Script, Parameters {
    function run() external view returns (address router){
        if (block.chainid == AVALANCHE_FUJI_CHAIN_ID) {
            router = AVALANCHE_FUJI_CCIP_ROUTER;
        } else if (block.chainid == ETHEREUM_SEPOLIA_CHAIN_ID) {
            router = ETHEREUM_SEPOLIA_CCIP_ROUTER;
        } else if (block.chainid == ARBITRUM_SEPOLIA_CHAIN_ID) {
            router = ARBITRUM_SEPOLIA_CCIP_ROUTER;
        } else if (block.chainid == POLYGON_AMOY_CHAIN_ID) {
            router = POLYGON_AMOY_CCIP_ROUTER;
        } else if (block.chainid == BASE_SEPOLIA_CHAIN_ID) {
            router = BASE_SEPOLIA_CCIP_ROUTER;
        } else if (block.chainid == OPTIMISM_SEPOLIA_CHAIN_ID) {
            router = OPTIMISM_SEPOLIA_CCIP_ROUTER;
        }
    }
}