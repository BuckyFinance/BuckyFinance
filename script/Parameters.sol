// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Parameters {
    //--------AVALANCHE PRICE FEED--------//
    address public constant BTC_PRICE_FEED = 0x31CF013A08c6Ac228C94551d535d5BAfE19c602a;
    address public constant ETH_PRICE_FEED = 0x86d67c3D38D2bCeE722E601025C25a575021c6EA;
    address public constant LINK_PRICE_FEED = 0x34C4c526902d88a3Aa98DB8a9b802603EB1E3470;
    address public constant AVAX_PRICE_FEED = 0x34C4c526902d88a3Aa98DB8a9b802603EB1E3470;
    address public constant UNI_PRICE_FEED = 0x7b219F57a8e9C7303204Af681e9fA69d17ef626f;
    address public constant USDC_PRICE_FEED = 0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad;
    address public constant USDT_PRICE_FEED = 0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad;


    //-------------ROUTER--------------//
    address public constant AVALANCHE_FUJI_CCIP_ROUTER = 0xF694E193200268f9a4868e4Aa017A0118C9a8177;
    address public constant ETHEREUM_SEPOLIA_CCIP_ROUTER = 0x5724B4Cc39a9690135F7273b44Dfd3BA6c0c69aD;
    address public constant ARBITRUM_SEPOLIA_CCIP_ROUTER = 0x8bB16BEDbFd62D1f905ACe8DBBF2954c8EEB4f66;
    address public constant POLYGON_AMOY_CCIP_ROUTER = 0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2;
    address public constant BASE_SEPOLIA_CCIP_ROUTER = 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93;
    address public constant OPTIMISM_SEPOLIA_CCIP_ROUTER = 0x114A20A10b43D4115e5aeef7345a1A71d2a60C57;


    //------------CHAIN_SELECTOR------------//
    uint64 public constant AVALANCHE_FUJI_CHAIN_SELECTOR = 14767482510784806043;
    uint64 public constant ETHEREUM_SEPOLIA_CHAIN_SELECTOR = 16015286601757825753;
    uint64 public constant ARBITRUM_SEPOLIA_CHAIN_SELECTOR = 3478487238524512106;
    uint64 public constant POLYGON_AMOY_CHAIN_SELECTOR = 16281711391670634445;
    uint64 public constant BASE_SEPOLIA_CHAIN_SELECTOR = 10344971235874465080;
    uint64 public constant OPTIMISM_SEPOLIA_CHAIN_SELECTOR = 5224473277236331295;


    //------------CHAIN_ID------------//
    uint64 public constant AVALANCHE_FUJI_CHAIN_ID = 43113;
    uint64 public constant ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
    uint64 public constant ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
    uint64 public constant POLYGON_AMOY_CHAIN_ID = 80002;
    uint64 public constant BASE_SEPOLIA_CHAIN_ID = 84532;
    uint64 public constant OPTIMISM_SEPOLIA_CHAIN_ID = 11155420;


    //---------FUNCTION ROUTER---------//
    address public constant AVALANCHE_FUJI_FUNCTIONS_ROUTER = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;
    bytes32 public constant AVALANCHE_FUJI_DON_ID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;


    //---------MAIN_ROUTER_CONTRACT_ON_AVALANCHE_FUJI---------//
    // Need to fix this after deploying the MainRouter contract
    address public constant AVALANCHE_FUJI_MAIN_ROUTER = address(0);


    //---------TOKEN_ON_ETHEREUM_SEPOLIA------------
    address public constant ETHEREUM_SEPOLIA_WBTC = address(0);
    address public constant ETHEREUM_SEPOLIA_WETH = address(0);
    address public constant ETHEREUM_SEPOLIA_LINK = address(0);
    address public constant ETHEREUM_SEPOLIA_AVAX = address(0);
    address public constant ETHEREUM_SEPOLIA_UNI = address(0);
    address public constant ETHEREUM_SEPOLIA_USDC = address(0);
    address public constant ETHEREUM_SEPOLIA_USDT = address(0);


    //---------TOKEN_ON_ARBITRUM_SEPOLIA------------
    address public constant ARBITRUM_SEPOLIA_WBTC = address(0);
    address public constant ARBITRUM_SEPOLIA_WETH = address(0);
    address public constant ARBITRUM_SEPOLIA_LINK = address(0);
    address public constant ARBITRUM_SEPOLIA_AVAX = address(0);
    address public constant ARBITRUM_SEPOLIA_UNI = address(0);
    address public constant ARBITRUM_SEPOLIA_USDC = address(0);
    address public constant ARBITRUM_SEPOLIA_USDT = address(0);

    //---------TOKEN_ON_AVALANCHE_FUJI------------
    address public constant AVALANCHE_FUJI_WBTC = address(0);
    address public constant AVALANCHE_FUJI_WETH = address(0);
    address public constant AVALANCHE_FUJI_LINK = address(0);
    address public constant AVALANCHE_FUJI_AVAX = address(0);
    address public constant AVALANCHE_FUJI_UNI = address(0);
    address public constant AVALANCHE_FUJI_USDC = address(0);
    address public constant AVALANCHE_FUJI_USDT = address(0);

    //---------TOKEN_ON_POLYGON_AMOY------------
    address public constant POLYGON_AMOY_WBTC = address(0);
    address public constant POLYGON_AMOY_WETH = address(0);
    address public constant POLYGON_AMOY_LINK = address(0);
    address public constant POLYGON_AMOY_AVAX = address(0);
    address public constant POLYGON_AMOY_UNI = address(0);
    address public constant POLYGON_AMOY_USDC = address(0);
    address public constant POLYGON_AMOY_USDT = address(0);

    //---------TOKEN_ON_BASE_SEPOLIA------------
    address public constant BASE_SEPOLIA_WBTC = address(0);
    address public constant BASE_SEPOLIA_WETH = address(0);
    address public constant BASE_SEPOLIA_LINK = address(0);
    address public constant BASE_SEPOLIA_AVAX = address(0);
    address public constant BASE_SEPOLIA_UNI = address(0);
    address public constant BASE_SEPOLIA_USDC = address(0);
    address public constant BASE_SEPOLIA_USDT = address(0);

    //---------TOKEN_ON_OPTIMISM_SEPOLIA------------
    address public constant OPTIMISM_SEPOLIA_WBTC = address(0);
    address public constant OPTIMISM_SEPOLIA_WETH = address(0);
    address public constant OPTIMISM_SEPOLIA_LINK = address(0);
    address public constant OPTIMISM_SEPOLIA_AVAX = address(0);
    address public constant OPTIMISM_SEPOLIA_UNI = address(0);
    address public constant OPTIMISM_SEPOLIA_USDC = address(0);
    address public constant OPTIMISM_SEPOLIA_USDT = address(0);
}
