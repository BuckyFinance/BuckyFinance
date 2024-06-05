const { ethers, Contract } = require('ethers');
const DepositorABI = require("../abi/Depositor.json");
const MainRouterABI = require("../abi/MainRouter.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getProvider,
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
    getWalletAddress,
    getNameOfDecimals,
} = require("./helper")

async function getDepositedAmount(desChainId, tokenSymbol, walletAddress) {
    const provider = getProvider(desChainId);

    const DEPOSITOR_ADDRESS = NetworkInfomation[desChainId].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, provider);

    const tokenInfo = NetworkInfomation[desChainId]["TOKEN"][tokenSymbol];
    const deposited = await depositorContract.getDeposited(walletAddress, tokenInfo.address);

    const nameOfDecimals = getNameOfDecimals(tokenInfo.decimals);
    const depositedValueFormat = ethers.utils.formatUnits(deposited, nameOfDecimals);
    //console.log(`Deposited in ${desChainId} with ${tokenSymbol} Amount: ${depositedValueFormat.toString()}`);
    return depositedValueFormat;
}

async function getDepositedValue(desChainId, tokenSymbol, walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[desChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, provider);
    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;
    const tokenInfo = NetworkInfomation[desChainId]["TOKEN"][tokenSymbol];

    const depositedAmount = await mainRouterContract.getUserDepositedAmount(walletAddress, CHAIN_SELECTOR, tokenInfo.address);
    const depositedValue = await mainRouterContract.getUserCollateralValue(walletAddress, CHAIN_SELECTOR, tokenInfo.address);
    const nameOfDecimals = getNameOfDecimals(tokenInfo.decimals);
    const depositedValueFormat = ethers.utils.formatUnits(depositedValue, nameOfDecimals);
    //console.log(`Deposited in ${desChainId} with ${tokenSymbol} Value: ${depositedValueFormat.toString()}`);

    return depositedValueFormat;
}


async function getTotalDepositedValueOnChain(desChainId, walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);
    const MAIN_ROUTER_ADDRESS = NetworkInfomation[desChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, provider);
    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOnChainInformation(walletAddress, CHAIN_SELECTOR);
    const totalCollateralFormat = ethers.utils.formatUnits(totalCollateral, "ether");
    //console.log(`Total Collateral in chain ${desChainId}: ${totalCollateralFormat.toString()}`);
    return totalCollateralFormat.toString();
}

async function getTotalDepositedValueOverallChain(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, provider);

    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOverallInformation(walletAddress);

    const totalCollateralFormat = ethers.utils.formatUnits(totalCollateral, "ether");
    //console.log(`Total Collateral overall chain: ${totalCollateralFormat.toString()}`);
    return totalCollateralFormat.toString();
}

async function main() {
    // switchCurrentChainId(11155111);
    // const currentChainID = getCurrentChainId();
    const walletAddress = "0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1";
    const desChainId = 11155111;
    const depositedAmountOnchain = await getDepositedAmount(desChainId, "WBTC", walletAddress);
    const depositedValueOnchain = await getDepositedValue(desChainId, "WBTC", walletAddress);
    const totalDepositedValueOnChain = await getTotalDepositedValueOnChain(desChainId, walletAddress);
    const totalDepositedValueOverallChain = await getTotalDepositedValueOverallChain(walletAddress);
}

main();

module.exports = {
    getDepositedAmount,
    getDepositedValue,
    getTotalDepositedValueOnChain,
    getTotalDepositedValueOverallChain,
}