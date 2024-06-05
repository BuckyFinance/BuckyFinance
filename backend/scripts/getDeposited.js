const { ethers, Contract } = require('ethers');
const DepositorABI = require("../../contracts/abi/Depositor.json");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
    getWalletAddress,
    getNameOfDecimals,
} = require("./helper")

async function getDepositedAmount(chainId, tokenSymbol, walletAddress) {
    const wallet = getWallet(chainId);

    const DEPOSITOR_ADDRESS = NetworkInfomation[chainId].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, wallet);

    const tokenInfo = NetworkInfomation[chainId]["TOKEN"][tokenSymbol];
    const deposited = await depositorContract.getDeposited(walletAddress, tokenInfo.address);

    const nameOfDecimals = getNameOfDecimals(tokenInfo.decimals);
    const depositedValueFormat = ethers.utils.formatUnits(deposited, nameOfDecimals);
    //console.log(`Deposited in ${chainId} with ${tokenSymbol}: ${depositedValueFormat.toString()}`);
    return depositedValueFormat;
}

async function getDepositedValue(chainId, tokenSymbol, walletAddress) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[chainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);
    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;
    const tokenInfo = NetworkInfomation[chainId]["TOKEN"][tokenSymbol];

    const depositedAmount = await mainRouterContract.getUserDepositedAmount(walletAddress, CHAIN_SELECTOR, tokenInfo.address);
    const depositedValue = await mainRouterContract.getUserCollateralValue(walletAddress, CHAIN_SELECTOR, tokenInfo.address);
    const nameOfDecimals = getNameOfDecimals(tokenInfo.decimals);
    const depositedValueFormat = ethers.utils.formatUnits(depositedValue, nameOfDecimals);
    //console.log(`Deposited in ${chainId} with ${tokenSymbol} Value: ${depositedValueFormat.toString()}`);

    return depositedValueFormat;
}


async function getTotalDepositedValueOnChain(chainId, walletAddress) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[chainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);
    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOnChainInformation(walletAddress, CHAIN_SELECTOR);
    const totalCollateralFormat = ethers.utils.formatUnits(totalCollateral, "ether");
    //console.log(`Total Collateral in chain ${chainId}: ${totalCollateralFormat.toString()}`);
    return totalCollateralFormat.toString();
}

async function getTotalDepositedValueOverallChain(walletAddress) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOverallInformation(walletAddress);

    const totalCollateralFormat = ethers.utils.formatUnits(totalCollateral, "ether");
    //console.log(`Total Collateral overall chain: ${totalCollateralFormat.toString()}`);
    return totalCollateralFormat.toString();
}

async function main() {
    switchCurrentChainId(11155111);
    const currentChainID = getCurrentChainId();
    const walletAddress = await getWalletAddress();
    const depositedAmountOnchain = await getDepositedAmount(currentChainID, "UNI", walletAddress);
    const depositedValueOnchain = await getDepositedValue(currentChainID, "UNI", walletAddress);
    const totalDepositedValueOnChain = await getTotalDepositedValueOnChain(currentChainID, walletAddress);
    const totalDepositedValueOverallChain = await getTotalDepositedValueOverallChain(walletAddress);
}

// main();

module.exports = {
    getDepositedAmount,
    getDepositedValue,
    getTotalDepositedValueOnChain,
    getTotalDepositedValueOverallChain,
}