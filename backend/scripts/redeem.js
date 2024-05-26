const { Contract, ethers } = require("ethers");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const ERC20MockABI = require("../../contracts/abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    currentChainID,
    getWallet,
    switchCurrentChainId,
    getCurrentChainId,
    getWalletAddress
} = require("./helper");
const { getTotalDepositedValueOnChain, getDepositedAmount } = require("./getDeposited");

async function getFeeToRedeemOnChain(mainRouterContract, CHAIN_SELECTOR, receiverAddress, tokenInfo, amountToRedeemInWei) {
    const feeToRedeem = await mainRouterContract.getRedeemFee(CHAIN_SELECTOR, receiverAddress, tokenInfo.address, amountToRedeemInWei);
    const feeToRedeemFormat = ethers.utils.formatUnits(feeToRedeem, "ether");
    console.log(`Fee to redeem: ${feeToRedeemFormat}`);
    return feeToRedeem;
}

async function redeem(chainId, tokenSymbol, amountToRedeem) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);
    const MAIN_ROUTER_ADDRESS = NetworkInfomation[chainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);
    const walletAddress = getWalletAddress();
    const totalDepositedOnChain = await getDepositedAmount(chainId, tokenSymbol, walletAddress);

    // console.log(totalDepositedOnChain);
    // console.log(amountToRedeem);
    if (totalDepositedOnChain < amountToRedeem) {
        return null;
    }

    const tokenInfo = NetworkInfomation[chainId]["TOKEN"][tokenSymbol];
    const amountToRedeemInWei = ethers.utils.parseUnits(amountToRedeem, 18);
    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[chainId].DEPOSITOR_ADDRESS
    const gasLimit = ethers.utils.hexlify(1000000);
    const value = await getFeeToRedeemOnChain(mainRouterContract, CHAIN_SELECTOR, receiverAddress, tokenInfo, amountToRedeemInWei);
    const tx = await mainRouterContract.redeem(CHAIN_SELECTOR, receiverAddress, tokenInfo.address, amountToRedeemInWei, {
        gasLimit: gasLimit,
        value: value
    });
    await tx.wait();
    console.log(`Redeemed with transaction hash: ${tx.hash}`);
}

async function main() {
    switchCurrentChainId(11155111);
    const currentChainID = getCurrentChainId();
    await redeem(currentChainID, "UNI", "25");
}

// main();

module.exports = {
    redeem,
}