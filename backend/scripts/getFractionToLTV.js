const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const {
    getWallet,
    getWalletAddress,
} = require("./helper")

async function getFractionToLTV() {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);
    const walletAddress = await getWalletAddress();

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, wallet);

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