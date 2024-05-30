const { ethers, Contract } = require('ethers');
const DepositorABI = require("../abi/Depositor.json");
const MainRouterABI = require("../abi/MainRouter.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    currentChainID,
    getWallet,
    getCurrentChainId,
    getProvider,
} = require("./helper")


async function getTokenPrice(tokenSymbol) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, provider);
    const tokenInfo = NetworkInfomation[avalancheFujiChainId]["TOKEN"][tokenSymbol];
    const tokenAddress = tokenInfo.address;

    const priceFeedsInUsd = await mainRouterContract.getTokenPrice(tokenAddress);
    const priceFeedsInUsdFormat = ethers.utils.formatUnits(priceFeedsInUsd, 8);
    console.log(`Price of token ${tokenSymbol}: ${priceFeedsInUsdFormat}`);
    return priceFeedsInUsdFormat;
}

async function main() {
    getTokenPrice("UNI");
}

// main();

module.exports = {
    getTokenPrice,
}