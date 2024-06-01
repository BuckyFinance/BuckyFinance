const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../abi/MainRouter.json");
const {
    getWallet,
    getWalletAddress,
    getProvider,
} = require("./helper")

async function getFeePay(walletAddress) {
    const avalancheFujiChainId = 43113;
    const provider = getProvider(avalancheFujiChainId);

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, provider);

    const feePay = await mainRouterContract.getFeePay(walletAddress);
    const feePayFormat = ethers.utils.formatUnits(feePay, "ether");
    console.log(`Fee pay of Address ${walletAddress}: ${feePayFormat}`);
    return feePayFormat;
}

async function main() {
    const walletAddress = "0x7aF234d569aB6360693806D7e7f439Ec2114F93c";
    getFeePay(walletAddress);
}

main();

module.exports = {
    getFeePay,
}