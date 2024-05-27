const { Contract, ethers } = require("ethers");
const MinterABI = require("../../contracts/abi/Minter.json");
const ERC20MockABI = require("../../contracts/abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getWalletAddress
} = require("./helper");
const { getTotalMintedValueOnChain } = require("./getMinted");

async function getBurnFeeOnChain(minterContract, amountToBurnInWei) {
    const burnFee = await minterContract.getBurnFee(amountToBurnInWei);
    const burnFeeFormat = ethers.utils.formatUnits(burnFee, "ether");
    console.log(`Burn fee: ${burnFeeFormat}`);
    return burnFeeFormat;
}

async function approveToken(wallet, tokenInfo, amountIn, chainId) {
    const tokenContract = new Contract(tokenInfo.address, ERC20MockABI, wallet);

    const MINTER_ADDRESS = NetworkInfomation[chainId].MINTER_ADDRESS;
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), tokenInfo.decimals);
    const tx = await tokenContract.approve(MINTER_ADDRESS, amountInWei);
    await tx.wait();
    console.log(`Approved with transaction hash: ${tx.hash}`);
}

async function burn(chainId, amountToBurn) {
    const wallet = getWallet(chainId);
    const MINTER_ADDRESS = NetworkInfomation[chainId].MINTER_ADDRESS;
    const minterContract = new Contract(MINTER_ADDRESS, MinterABI, wallet);
    const walletAddress = await getWalletAddress();
    const totalMintedOnchain = await getTotalMintedValueOnChain(chainId);
    // console.log(totalMintedOnchain);
    // console.log(amountToBurn);
    if (totalMintedOnchain < amountToBurn) {
        return null;
    }

    const tokenInfo = NetworkInfomation[chainId]["TOKEN"]["DSC"];
    await approveToken(wallet, tokenInfo, amountToBurn, chainId);

    const gasLimit = ethers.utils.hexlify(1000000);
    const amountToBurnInWei = ethers.utils.parseUnits(amountToBurn, 18);
    const value = await getBurnFeeOnChain(minterContract, amountToBurnInWei);
    const tx = await minterContract.burn(amountToBurnInWei, {
        gasLimit: gasLimit,
        value: value
    });
    await tx.wait();
    console.log(`Burned with transaction hash: ${tx.hash}`);
}

async function main() {
    const desChainId = 84532;
    await burn(desChainId, "2");
}

// main();

module.exports = {
    burn,
}