const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const { getTotalDepositedValueOverallChain } = require("../scripts/getDeposited");
const { getTotalMintedValueOverallChain } = require("../scripts/getMinted");
const {
    currentChainID,
    getWallet,
    getWalletAddress,
} = require("./helper");
const { getMaxOutputCanBeMinted } = require("./getMaxOutput");

async function getMintFeeOnChain(mainRouterContract, CHAIN_SELECTOR, receiverAddress, amountOutInWei) {
    const mintFee = await mainRouterContract.getMintFee(CHAIN_SELECTOR, receiverAddress, amountOutInWei);
    const mintFeeFormat = ethers.utils.formatUnits(mintFee, "ether");
    console.log(`Fee to mint: ${mintFeeFormat}`);
    return mintFee;
}

async function mint(chainId, amountOut) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[chainId].MINTER_ADDRESS;
    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;

    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, wallet);
    const amountOutInWei = ethers.utils.parseUnits(amountOut, 18);
    const gasLimit = ethers.utils.hexlify(1000000);
    const value = await getMintFeeOnChain(mainRouterContract, CHAIN_SELECTOR, receiverAddress, amountOutInWei);
    const canBeMinted = await getMaxOutputCanBeMinted();

    // console.log(canBeMinted);
    // console.log(amountOut);

    if (canBeMinted < amountOut) {
        return null;
    }

    const tx = await mainRouterContract.mint(CHAIN_SELECTOR, receiverAddress, amountOutInWei, {
        gasLimit: gasLimit,
        value: value,
    });
    await tx.wait();
    console.log(`Minted on chain ${chainId} with tx hash: ${tx.hash}`);
}

async function main() {
    const chainIdDestination = 84532;
    await mint(chainIdDestination, "32");
}

// main();

module.exports = {
    mint,
}