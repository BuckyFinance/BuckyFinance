const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../abi/MainRouter.json");
const {
    getWallet,
    getWalletAddress,
    getProvider
} = require("./helper")

async function getHealthFactor(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, provider);

    const healthFactor = await mainRouterContract.getUserHealthFactor(walletAddress);
    if (healthFactor.toString().length > 18) {
        console.log("User hasn't minted")
        return 0;
    }

    const healthFactorFormat = ethers.utils.formatUnits(healthFactor, "ether");
    console.log(`Health Factor of Address ${walletAddress}: ${healthFactorFormat}`);
    return healthFactorFormat;
}

async function main() {
    const walletAddress = await getWalletAddress();
    const healthFactor = await getHealthFactor(walletAddress);
}

// main();

module.exports = {
    getHealthFactor,
}