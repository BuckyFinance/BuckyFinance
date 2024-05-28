const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../abi/MainRouter.json");
const {
    getWallet,
    getWalletAddress,
    getProvider,
} = require("./helper")

async function getFractionToLTV(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, provider);

    const fractionToLTV = await mainRouterContract.getUserFractionToLTV(walletAddress);
    if (fractionToLTV.toString().length > 18) {
        console.log("User hasn't minted");
        return 0;
    }
    const fractionToLTVFormat = ethers.utils.formatUnits(fractionToLTV, "ether");
    console.log(`Fraction to LTV of Address ${walletAddress}: ${fractionToLTVFormat}`);
    return fractionToLTVFormat;
}

async function main() {
    const walletAddress = await getWalletAddress();
    const fractionToLTV = await getFractionToLTV();
    console.log(fractionToLTV);
}

main();

module.exports = {
    getFractionToLTV,
}