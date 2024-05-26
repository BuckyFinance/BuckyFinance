const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const {
    currentChainID,
    getWallet,
} = require("./helper")

async function getFractionToLTV(walletAddress) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, wallet);

    const healthFactor = await mainRouterContract.getUserFractionToLTV(walletAddress);
    console.log(`Health Factor of Address ${walletAddress}: ${healthFactor}`);
    return healthFactor;
}

module.exports = {
    getFractionToLTV,
}