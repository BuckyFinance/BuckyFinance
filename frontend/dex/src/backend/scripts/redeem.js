const { Contract, ethers } = require("ethers");
const MainRouterABI = require("../abi/MainRouter.json");
const ERC20MockABI = require("../abi/ERC20Mock.json");
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

async function redeem(desChainId, tokenSymbol, amountToRedeem, signerFromFE, isCalledFromFE) {
    const avalancheFujiChainId = 43113;
    let wallet;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
    } else {
        wallet = getWallet(avalancheFujiChainId);
    }
    const walletAddress = await wallet.getAddress();

    const MAIN_ROUTER_ADDRESS = NetworkInfomation[desChainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);
    const totalDepositedOnChain = parseFloat(await getDepositedAmount(desChainId, tokenSymbol, walletAddress));

    // console.log(totalDepositedOnChain);
    // console.log(amountToRedeem);
    if (totalDepositedOnChain < amountToRedeem) {
        return null;
    }

    const tokenInfo = NetworkInfomation[desChainId]["TOKEN"][tokenSymbol];
    const amountToRedeemInWei = ethers.utils.parseUnits(amountToRedeem, 18);
    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[desChainId].DEPOSITOR_ADDRESS
    const gasLimit = ethers.utils.hexlify(1000000);
    const value = await getFeeToRedeemOnChain(mainRouterContract, CHAIN_SELECTOR, receiverAddress, tokenInfo, amountToRedeemInWei);
    // const value = await ethers.utils.parseEther("0.02");
    const tx = await mainRouterContract.redeem(CHAIN_SELECTOR, receiverAddress, tokenInfo.address, amountToRedeemInWei, {
        value: value
    });
    //await tx.wait();
    console.log(`Redeemed with transaction hash: ${tx.hash}`);
    return tx.hash;
}

async function main() {
    // switchCurrentChainId(11155111);
    // const currentChainID = getCurrentChainId();
    await redeem(11155111, "UNI", "20");
}

// main();

module.exports = {
    redeem,
}