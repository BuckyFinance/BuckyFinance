const { Contract, ethers } = require("ethers");
const MinterABI = require("../../contracts/abi/Minter.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet
} = require("./helper");
const { getTotalMintedValueOnChain } = require("./getMinted");

async function burn(chainId, amountToBurn) {
    const wallet = getWallet(chainId);
    const MINTER_ADDRESS = NetworkInfomation[chainId].MINTER_ADDRESS;
    const minterContract = new Contract(MINTER_ADDRESS, MinterABI, wallet);

    const totalMintedOnchain = await getTotalMintedValueOnChain(chainId);
    const totalMintedOnchainFormat = ethers.utils.formatUnits(totalMintedOnchain, "ether");
    // console.log(totalMintedOnchainFormat);
    // console.log(amountToBurn);
    // if (totalMintedOnchainFormat < amountToBurn) {
    //     return null;
    // }

    const gasLimit = ethers.utils.hexlify(1000000);
    const value = ethers.utils.parseEther("0.02");
    const amountToBurnInWei = ethers.utils.parseUnits(amountToBurn, 18);
    const tx = await minterContract.burn(amountToBurnInWei, {
        gasLimit: gasLimit,
        value: value
    });
    await tx.wait();
    console.log(tx.hash);
}

module.exports = {
    burn,
}