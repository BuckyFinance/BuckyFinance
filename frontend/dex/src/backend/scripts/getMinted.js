const { ethers, Contract } = require('ethers');
const DepositorABI = require("../abi/Depositor.json");
const MainRouterABI = require("../abi/MainRouter.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    getWalletAddress,
    getProvider,
} = require("./helper")


async function getTotalMintedValueOnChain(desChainId, walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[desChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, provider);
    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOnChainInformation(walletAddress, CHAIN_SELECTOR);
    const totalMintedFormat = ethers.utils.formatUnits(totalMinted, "ether");
    //console.log(`Total minted in chain ${desChainId}: ${totalMintedFormat}`);
    return totalMintedFormat;
}

async function getTotalMintedValueOverallChain(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, provider);

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOverallInformation(walletAddress);
    const totalMintedFormat = ethers.utils.formatUnits(totalMinted);
    //console.log(`Total minted overall chain: ${totalMintedFormat}`);
    return totalMintedFormat;
}

async function main() {
    const walletAddress = "0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1"
    await getTotalMintedValueOnChain(84532, walletAddress);
    await getTotalMintedValueOverallChain(walletAddress);
}

// main();

module.exports = {
    getTotalMintedValueOnChain,
    getTotalMintedValueOverallChain,
}