const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../abi/MainRouter.json");
const {
    getWallet,
    getWalletAddress,
    getProvider,
} = require("./helper")

async function requestCreditScore(signerFromFE, isCalledFromFE) {
    const avalancheFujiChainId = 43113;
    let wallet;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
    } else {
        wallet = getWallet(avalancheFujiChainId);
    }
    const walletAddress = await wallet.getAddress();
    // console.log(provider)

    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, wallet);
    // const vitalikAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const args = [walletAddress];
    const tx = await mainRouterContract.sendRequestToCalculateActivityCredit(walletAddress, args);
    await tx.wait();
    console.log(`Request credit scrore with tx hash: ${tx.hash}`);
}

async function main() {
    await requestCreditScore("", false);
}

//main();

module.exports = {
    requestCreditScore,
}