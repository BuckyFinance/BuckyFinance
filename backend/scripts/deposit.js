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

async function approveToken(wallet, tokenInfo, amountIn) {
    const currentChainID = getCurrentChainId();
    const tokenContract = new Contract(tokenInfo.address, ERC20MockABI, wallet);
    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenInfo.decimals);

    const tx = await tokenContract.approve(DEPOSITOR_ADDRESS, amountInWei);
    await tx.wait();
    console.log(`Approved token with tx hash: ${tx.hash}`);
}

async function deposit(tokenSymbol, amountIn) {
    const currentChainID = getCurrentChainId();
    const wallet = getWallet(currentChainID);

    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, wallet);
    // console.log(depositorContract);
    const tokenInfo = NetworkInfomation[currentChainID]["TOKEN"][tokenSymbol];

    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenInfo.decimals);
    // get fee to deposit on chain
    const value = ethers.utils.parseEther("0.02");
    const gasLimit = ethers.utils.hexlify(1000000);
    await approveToken(wallet, tokenInfo, amountIn);

    const tx = await depositorContract.deposit(tokenInfo.address, amountInWei, {
        gasLimit: gasLimit,
        value: value,
    });
    await tx.wait();
    console.log(`Deposited with tx hash: ${tx.hash}`);
}

async function main() {
    switchCurrentChainId(84532);
    const currentChainID = getCurrentChainId();
    // console.log(currentChainID);
    deposit("UNI", 50);
}

// main();

module.exports = {
    deposit
}