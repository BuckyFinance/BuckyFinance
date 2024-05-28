require("dotenv").config();
const { ethers, Contract } = require('ethers');
const DepositorABI = require("../../contracts/abi/Depositor.json");
const ERC20MockABI = require("../../contracts/abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
} = require("./helper");
const { mint } = require("./mint");
const { getTokenPrice } = require("../scripts/getTokenPrice");

async function checkCanDepositAndMint(tokenSymbol, amountToDeposit, amountToMint) {
    const tokenPrice = getTokenPrice(tokenSymbol);
    const depositValue = tokenPrice * amountToDeposit;

    if (depositValue >= amountToMint) {
        return true;
    }
    return false;

}

async function approveToken(wallet, tokenInfo, amountIn) {
    const currentChainID = getCurrentChainId();
    const tokenContract = new Contract(tokenInfo.address, ERC20MockABI, wallet);
    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenInfo.decimals);

    const tx = await tokenContract.approve(DEPOSITOR_ADDRESS, amountInWei);
    await tx.wait();
    console.log(`Approved token with tx hash: ${tx.hash}`);
}

async function depositAndMint(tokenSymbol, amountToDeposit, desChainId, amountToMint) {
    const currentChainID = getCurrentChainId();
    const wallet = getWallet(currentChainID);

    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, wallet);
    // console.log(depositorContract);
    const tokenInfo = NetworkInfomation[currentChainID]["TOKEN"][tokenSymbol];
    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[desChainId].CHAIN_SELECTOR;
    const amountToDepositInWei = ethers.utils.parseUnits(amountToDeposit.toString(), tokenInfo.decimals);
    const amountToMintInWei = ethers.utils.parseUnits(amountToMint.toString(), 18);
    const value = ethers.utils.parseEther("0.02");
    const gasLimit = ethers.utils.hexlify(1000000);
    await approveToken(wallet, tokenInfo, amountToDeposit);

    const canDepositAndMint = await checkCanDepositAndMint(tokenSymbol, amountToDeposit, amountToMint);
    if (canDepositAndMint == false) {
        console.log(`Can't deposit and mint`);
        return null;
    }
    const tx = await depositorContract.depositAndMint(
        tokenInfo.address,
        amountToDepositInWei,
        CHAIN_SELECTOR,
        receiverAddress,
        amountToMintInWei,
        {
            gasLimit: gasLimit,
            value: value,
        }
    );
    await tx.wait();
    console.log(`Deposited and minted from chain ${currentChainID} to chain ${desChainId} with tx hash: ${tx.hash}`);
}

async function main() {
    switchCurrentChainId(11155111);
    // console.log(currentChainID);
    await depositAndMint("UNI", 25, 84532, 10);
}

main();

module.exports = {
    depositAndMint,
}