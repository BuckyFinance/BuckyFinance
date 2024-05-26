require("dotenv").config();
const { ethers, Contract } = require('ethers');
const DepositorABI = require("../../contracts/abi/Depositor.json");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    getWalletAddress,
} = require("./helper")


async function getTotalMintedValueOnChain(chainId, walletAddress) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[chainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);
    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOnChainInformation(walletAddress, CHAIN_SELECTOR);
    const totalMintedFormat = ethers.utils.formatUnits(totalMinted, "ether");
    console.log(`Total minted in chain ${chainId}: ${totalMintedFormat}`);
    return totalMintedFormat;
}

async function getTotalMintedValueOverallChain(walletAddress) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOverallInformation(walletAddress);
    const totalMintedFormat = ethers.utils.formatUnits(totalMinted);
    console.log(`Total minted overall chain: ${totalMintedFormat}`);
    return totalMintedFormat;
}

async function main() {
    const walletAddress = await getWalletAddress();
    await getTotalMintedValueOnChain(84532, walletAddress);
    await getTotalMintedValueOverallChain(walletAddress);
}

// main();

module.exports = {
    getTotalMintedValueOnChain,
    getTotalMintedValueOverallChain,
}