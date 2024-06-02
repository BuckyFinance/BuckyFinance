const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../abi/MainRouter.json");
const {
    getWallet,
    getWalletAddress,
    getProvider,
} = require("./helper")

async function getUserActivityCredit(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, provider);

    const activityCredit = parseFloat(await mainRouterContract.getUserActivityCredit(walletAddress));

    console.log(`Activity credit of Address ${walletAddress}: ${activityCredit}`);
    return activityCredit;
}

async function getUserProtocolCredit(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, provider);

    const protocolCredit = parseFloat(await mainRouterContract.getUserProtocolCredit(walletAddress));

    console.log(`Protocol credit of Address ${walletAddress}: ${protocolCredit.toString()}`);
    return protocolCredit;
}

async function getTotalCreditScore(walletAddress) {
    const activityCredit = await getUserActivityCredit(walletAddress);
    const protocolCredit = await getUserProtocolCredit(walletAddress);
    const totalCredit = activityCredit + protocolCredit;
    console.log(`Total credit score: ${totalCredit}`)
    return  totalCredit;
}

async function main() {
    const walletAddress = "0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1";
    const vitalikAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    await getTotalCreditScore(vitalikAddress);
}

//main();

module.exports = {
    getUserActivityCredit,
    getUserProtocolCredit,
    getTotalCreditScore
}