// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Parameters {
    enum AllowedTokens {
        BTC,
        ETH,
        LINK,
        AVAX,
        UNI,
        USDC,
        USDT
    }

    uint256 public constant NUM_OF_ALLOW_TOKENS = 7;

    mapping (uint64 chainSelector => address[] tokenAddress) public chainTokenAddress;
    

}