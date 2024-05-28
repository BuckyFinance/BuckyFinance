require("dotenv").config();
const { ethers, Contract } = require('ethers');
const DepositorABI = require("../../../../../contracts/abi//Depositor.json");
const ERC20MockABI = require("../../../../../contracts/abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
} = require("./helper");
const { mint } = require("./mint");

async function approveToken(wallet, currentChainID, tokenInfo, amountIn) {
    const tokenContract = new Contract(tokenInfo.address, ERC20MockABI, wallet);
    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenInfo.decimals);
    const tx = await tokenContract.approve(DEPOSITOR_ADDRESS, amountInWei);
    await tx.wait();
    console.log(`Approved token with tx hash: ${tx.hash}`);
}

async function deposit(tokenSymbol, amountIn, signerFromFE, isCalledFromFE) {
    let wallet;
    let currentChainID;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
        currentChainID = await wallet.getChainId();
    } else {
        currentChainID = getCurrentChainId();
        wallet = getWallet(currentChainID);
    }

    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, wallet);
    // console.log(depositorContract);
    const tokenInfo = NetworkInfomation[currentChainID]["TOKEN"][tokenSymbol];

    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenInfo.decimals);
    // get fee to deposit on chain
    const value = ethers.utils.parseEther("0.02");
    const gasLimit = ethers.utils.hexlify(1000000);
    await approveToken(wallet, currentChainID, tokenInfo, amountIn);

    const tx = await depositorContract.deposit(tokenInfo.address, amountInWei, {
        gasLimit: gasLimit,
        value: value,
    });
    await tx.wait();
    console.log(`Deposited with tx hash: ${tx.hash}`);
    return tx.hash;
}

async function main() {
    // switchCurrentChainId(84532);
    // const currentChainID = getCurrentChainId();
    // console.log(currentChainID);
    await deposit("UNI", 25, "", false);
}

// main();

module.exports = {
    deposit
}