const { ethers, Contract } = require('ethers');
const MinterABI = require("../abi/Minter.json");
const ERC20MockABI = require("../abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
} = require("./helper");
const { getTokenPrice } = require("../scripts/getTokenPrice");
const { getTotalMintedValueOnChain } = require('./getMinted');

async function getBurnAndMintFee(minterContract, amountToBurnAndMint, CHAIN_SELECTOR, receiverAddress) {
    const burnAndMintFee = await minterContract.getBurnAndMintFee(
        amountToBurnAndMint,
        CHAIN_SELECTOR,
        receiverAddress,
    );
    const burnAndMintFeeFormat = ethers.utils.formatUnits(burnAndMintFee, "ether");
    console.log(`Burned Fee: ${burnAndMintFeeFormat}`);
    return burnAndMintFee;
}

async function checkCanBurnAndMint(currentChainID, walletAddress, amountToBurnAndMint) {
    const totalMintedOnchain = parseFloat(await getTotalMintedValueOnChain(currentChainID, walletAddress));
    if (totalMintedOnchain < amountToBurnAndMint) {
        return false;
    }
    return true;
}

async function approveToken(wallet, currentChainID, tokenInfo, amountToBurnAndMint) {
    const tokenContract = new Contract(tokenInfo.address, ERC20MockABI, wallet);

    const MINTER_ADDRESS = NetworkInfomation[currentChainID].MINTER_ADDRESS;
    const amountToBurnAndMintInWei = ethers.utils.parseUnits(amountToBurnAndMint.toString(), 18);
    const tx = await tokenContract.approve(MINTER_ADDRESS, amountToBurnAndMintInWei);
    await tx.wait();
    console.log(`Approved with transaction hash: ${tx.hash}`);
}

async function burnAndMint(amountToBurnAndMint, desChainId, signerFromFE, isCalledFromFE) {
    let wallet;
    let currentChainID;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
        currentChainID = await wallet.getChainId();
    } else {
        currentChainID = getCurrentChainId();
        wallet = getWallet(currentChainID);
    }

    const MINTER_ADDRESS = NetworkInfomation[currentChainID].MINTER_ADDRESS;
    const minterContract = new Contract(MINTER_ADDRESS, MinterABI, wallet);
    // console.log(depositorContract);
    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[desChainId].MINTER_ADDRESS;
    const amountToBurnAndMintInWei = ethers.utils.parseUnits(amountToBurnAndMint.toString(), 18);
    // const value = ethers.utils.parseEther("0.02");
    const value = await getBurnAndMintFee(
        minterContract,
        amountToBurnAndMintInWei,
        CHAIN_SELECTOR,
        receiverAddress
    );
    const gasLimit = ethers.utils.hexlify(1000000);
    const tokenInfo = NetworkInfomation[currentChainID]["TOKEN"]["DSC"];
    await approveToken(wallet, currentChainID, tokenInfo, amountToBurnAndMint);

    const walletAddress = await wallet.getAddress();
    const canBurnAndMint = await checkCanBurnAndMint(currentChainID, walletAddress, amountToBurnAndMint);
    if (canBurnAndMint == false) {
        console.log(`Can't burn and mint`);
        return null;
    } else {
        console.log("Can burn and mint");
    }

    // console.log(tokenInfo.address)
    // console.log(amountToDepositInWei)
    // console.log(CHAIN_SELECTOR)
    // console.log(receiverAddress)
    // console.log(amountToMintInWei)
    const tx = await minterContract.burnAndMint(
        amountToBurnAndMintInWei,
        CHAIN_SELECTOR,
        receiverAddress,
        {
            value: value
        }
    );
    // await tx.wait();
    console.log(`Burned and minted from chain ${currentChainID} to chain ${desChainId} with tx hash: ${tx.hash}`);
    return tx.hash;
}

async function main() {
    switchCurrentChainId(80002);
    const currentChainID = getCurrentChainId();
    console.log(currentChainID);
    await burnAndMint(9, 84532, "", false);
}

///main();

module.exports = {
    burnAndMint,
}