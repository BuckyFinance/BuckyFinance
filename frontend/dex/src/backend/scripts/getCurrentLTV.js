const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../abi/MainRouter.json");
const {
    getWallet,
    getWalletAddress,
    getProvider,
} = require("./helper")

async function getCurrentLTV(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);
    // console.log(provider)

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, provider);

    const currentLTV = await mainRouterContract.calculateLTV(walletAddress);

    const currentLTVFormat = ethers.utils.formatUnits(currentLTV, "ether");
    //console.log(`Current LTV of Address ${walletAddress}: ${currentLTVFormat}`);
    return currentLTVFormat;
}

async function main() {
    const walletAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const currentLTV = await getCurrentLTV(walletAddress);
    console.log(currentLTV);
}

// main();

module.exports = {
    getCurrentLTV,
}