require("dotenv").config();
const { ethers, Contract } = require('ethers');
const DepositorABI = require("../../contracts/abi/Depositor.json");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const NetworkInfomation = require("../NetworkInfomation.json");
const {
    currentChainID,
    getWallet,
    getCurrentChainId,
} = require("./helper")

async function getDepositedEachChainEachToken(chainId, tokenSymbol) {
    const wallet = getWallet();

    const DEPOSITOR_ADDRESS = NetworkInfomation[chainId].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, wallet);

    const tokenAddress = NetworkInfomation[chainId]["TOKEN"][tokenSymbol].address;
    const walletAddress = "0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1";
    const deposited = await depositorContract.getDeposited(walletAddress, tokenAddress);

    console.log(deposited.toString());
    return deposited.toString();
}

async function getTotalDepositedEachChainValue(chainId) {
    const wallet = getWallet();

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[chainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);
    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;
    const walletAddress = "0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1";
    console.log(MAIN_ROUTER_ADDRESS);
    const { totalCollateral, totalMinted } = await mainRouterContract.getUserOnChainInformation(walletAddress, CHAIN_SELECTOR);
    return totalCollateral;
}

module.exports = {
    getDepositedEachChainEachToken,
    getTotalDepositedEachChainValue,
}