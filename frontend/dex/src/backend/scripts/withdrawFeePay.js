const { ethers, Contract, Wallet } = require('ethers');
const MainRouterABI = require("../abi/MainRouter.json")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
} = require("./helper");
const { getFeePay } = require('./getFeePay');

async function checkCanWithdrawFeePay(walletAddress, amountToWithdraw) {
    const currentFeePay = parseFloat(await getFeePay(walletAddress));
    if (currentFeePay > amountToWithdraw) {
        return false;
    }
    return true;
}

async function withdrawFeePay(amountToWithdraw, signerFromFE, isCalledFromFE) {
    const avalancheFujiChainId = 43113;
    let wallet;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
    } else {
        wallet = getWallet(avalancheFujiChainId);
    }
    const walletAddress = await wallet.getAddress();
    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, wallet);
    const amountToWithdrawInWei = ethers.utils.parseEther(amountToWithdraw.toString());
    const canWithdrawFeePay = checkCanWithdrawFeePay(walletAddress, amountToWithdrawInWei);
    if (canWithdrawFeePay == false) {
        console.log("Not enough money to withdraw");
        return null;
    }

    const tx = await mainRouterContract.withdrawFeePay(amountToWithdrawInWei);
    //  await tx.wait();
    console.log(`Withdraw fee pay with tx hash: ${tx.hash}`);
    return tx.hash;
}

async function main() {
    await withdrawFeePay("0.1", "", false);
}

// main();

module.exports = {
    withdrawFeePay
}