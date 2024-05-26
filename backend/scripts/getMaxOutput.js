const { ethers } = require("ethers");
const { getTotalDepositedValueOverallChain } = require("../scripts/getDeposited");
const { getTotalMintedValueOverallChain } = require("../scripts/getMinted");

async function getMaxOutputCanBeMinted() {
    const totalDeposited = await getTotalDepositedValueOverallChain();
    const totalDepositedFormat = ethers.utils.formatUnits(totalDeposited, "ether")
    const LTV = 0.65;
    const maxOutput = totalDepositedFormat * LTV;
    const totalMinted = await getTotalMintedValueOverallChain();
    const totalMintedFormat = ethers.utils.formatUnits(totalMinted, "ether");
    const canBeMinted = maxOutput - totalMintedFormat;
    console.log(`Max Output can be minted: ${canBeMinted}`);
    return canBeMinted;
}

module.exports = {
    getMaxOutputCanBeMinted
}