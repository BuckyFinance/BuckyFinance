const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const { getTotalDepositedValueOverallChain } = require("../scripts/getDeposited");
const { getTotalMintedValueOverallChain } = require("../scripts/getMinted");
const {
    currentChainID,
    getWallet,
} = require("./helper");
const { getMaxOutputCanBeMinted } = require("./getMaxOutput");



async function mint(chainId, amountOut) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);

    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[chainId].MINTER_ADDRESS;
    const mainRouterAddress = NetworkInfomation[chainId].MAIN_ROUTER_ADDRESS;

    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, wallet);
    const amountOutInWei = ethers.utils.parseUnits(amountOut, 18);
    const gasLimit = ethers.utils.hexlify(1000000);
    const value = ethers.utils.parseEther("0.02");

    const canBeMinted = await getMaxOutputCanBeMinted();

    if (canBeMinted < amountOut) {
        return null;
    }

    const tx = await mainRouterContract.mint(CHAIN_SELECTOR, receiverAddress, amountOutInWei, {
        gasLimit: gasLimit,
        value: value,
    });
    await tx.wait();
    console.log(tx.hash);
}

module.exports = {
    mint,
}