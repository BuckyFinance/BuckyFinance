const { ethers, Contract } = require('ethers');
const DepositorABI = require("../abi/Depositor.json");
const ERC20MockABI = require("../abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
} = require("./helper");
const { getTokenPrice } = require("../scripts/getTokenPrice");
const { getCurrentLTV } = require('./getCurrentLTV');

async function getDepositAndMintFee(depositorContract, tokenAddress, amountToDepositInWei, CHAIN_SELECTOR, receiverAddress, amountToMintInWei) {
    const depositFee = await depositorContract.getDepositAndMintFee(
        tokenAddress,
        amountToDepositInWei,
        CHAIN_SELECTOR,
        receiverAddress,
        amountToMintInWei
    );
    const depositFeeFormat = ethers.utils.formatUnits(depositFee, "ether");
    console.log(`Deposit Fee: ${depositFeeFormat}`);
    return depositFee;
}

async function getLTV(walletAddress) {
    const currentLTV = await getCurrentLTV(walletAddress);
    console.log(`Current LTV: ${currentLTV}`);
    return currentLTV;
}

async function checkCanDepositAndMint(tokenSymbol, amountToDeposit, amountToMint, currentAddress) {
    const tokenPrice = await getTokenPrice(tokenSymbol);
    const depositValue = tokenPrice * amountToDeposit;
    const ltv = await getLTV(currentAddress);
    const canBeMinted = depositValue * ltv / 100;
    // console.log(canBeMinted)
    // console.log(amountToMint)
    console.log(canBeMinted)
    if (canBeMinted >= amountToMint) {
        return true;
    }
    return false;

}

async function getMaxCanBeMinted(tokenSymbol, amountToDeposit, amountToMint, walletAddress) {
    if (amountToDeposit != amountToDeposit)
        return 0;

    const tokenPrice = await getTokenPrice(tokenSymbol);
    const depositValue = tokenPrice * amountToDeposit;
    const ltv = await getLTV(walletAddress);
    const canBeMinted = depositValue * ltv / 100;
    return canBeMinted;

}


async function approveToken(wallet, currentChainID, tokenInfo, amountIn) {
    const tokenContract = new Contract(tokenInfo.address, ERC20MockABI, wallet);
    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenInfo.decimals);
    const tx = await tokenContract.approve(DEPOSITOR_ADDRESS, amountInWei);
    await tx.wait();
    console.log(`Approved token with tx hash: ${tx.hash}`);
}

async function depositAndMint(tokenSymbol, amountToDeposit, desChainId, amountToMint, signerFromFE, isCalledFromFE) {
    let wallet;
    let currentChainID;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
        currentChainID = await wallet.getChainId();
    } else {
        currentChainID = getCurrentChainId();
        wallet = getWallet(currentChainID);
    }
    const walletAddress = await wallet.getAddress();

    const DEPOSITOR_ADDRESS = NetworkInfomation[currentChainID].DEPOSITOR_ADDRESS;
    const depositorContract = new Contract(DEPOSITOR_ADDRESS, DepositorABI, wallet);
    // console.log(depositorContract);
    const tokenInfo = NetworkInfomation[currentChainID]["TOKEN"][tokenSymbol];
    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[desChainId].MINTER_ADDRESS;
    const amountToDepositInWei = ethers.utils.parseUnits(amountToDeposit.toString(), tokenInfo.decimals);
    const amountToMintInWei = ethers.utils.parseUnits(amountToMint.toString(), 18);
    // const value = ethers.utils.parseEther("0.02");
    const value = await getDepositAndMintFee(
        depositorContract,
        tokenInfo.address,
        amountToDepositInWei,
        CHAIN_SELECTOR,
        receiverAddress,
        amountToMintInWei
    );
    const gasLimit = ethers.utils.hexlify(1000000);
    await approveToken(wallet, currentChainID, tokenInfo, amountToDeposit);

    const canDepositAndMint = await checkCanDepositAndMint(tokenSymbol, amountToDeposit, amountToMint, walletAddress);
    if (canDepositAndMint == false) {
        console.log(`Can't deposit and mint`);
        return null;
    } else {
        console.log("Can deposit and mint");
    }

    // console.log(tokenInfo.address)
    // console.log(amountToDepositInWei)
    // console.log(CHAIN_SELECTOR)
    // console.log(receiverAddress)
    // console.log(amountToMintInWei)
    const tx = await depositorContract.depositAndMint(
        tokenInfo.address,
        amountToDepositInWei,
        CHAIN_SELECTOR,
        receiverAddress,
        amountToMintInWei,
        {
            value: value
        }
    );
    // await tx.wait();
    console.log(`Deposited and minted from chain ${currentChainID} to chain ${desChainId} with tx hash: ${tx.hash}`);
    return tx.hash;
}

async function main() {
    // switchCurrentChainId(11155111);
    // // console.log(currentChainID);
    await depositAndMint("UNI", 80, 80002, 10);
}

//main();

module.exports = {
    depositAndMint,
    getMaxCanBeMinted
}