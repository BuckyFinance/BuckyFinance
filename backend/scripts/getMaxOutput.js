const { ethers, Contract } = require("ethers");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    switchCurrentChainId,
    getCurrentChainId,
    getWalletAddress,
} = require("../scripts/helper");
const { getTotalDepositedValueOverallChain } = require("../scripts/getDeposited");
const { getTotalMintedValueOverallChain } = require("../scripts/getMinted");

async function getMaxOutputCanBeMintedOnChain(walletAddress) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);
    const MAIN_ROUTER_ADDRESS = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);

    const canBeMinted = await mainRouterContract.getMaximumAllowedMinting(walletAddress);
    const canBeMintedFormat = ethers.utils.formatUnits(canBeMinted, "ether");
    console.log(`Max Output can be minted: ${canBeMintedFormat}`);
    return canBeMintedFormat;
}

async function getMaxOutputCanBeMinted(walletAddress) {
    const totalDeposited = await getTotalDepositedValueOverallChain(walletAddress);
    const LTV = 0.65;
    const maxOutput = totalDeposited * LTV;
    const totalMinted = await getTotalMintedValueOverallChain(walletAddress);
    const canBeMinted = maxOutput - totalMinted;
    console.log(`Max Output can be minted: ${canBeMinted}`);
    return canBeMinted;
}

async function main() {
    switchCurrentChainId(11155111);
    const currentChainID = getCurrentChainId();
    const walletAddress = await getWalletAddress();
    // const canBeMinted = await getMaxOutputCanBeMinted(walletAddress);
    const canBeMinted = await getMaxOutputCanBeMintedOnChain(walletAddress);
}

// main();

module.exports = {
    getMaxOutputCanBeMinted
}