const { Contract, ethers } = require("ethers");
const MainRouterABI = require("../../contracts/abi/MainRouter.json");
const ERC20MockABI = require("../../contracts/abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    currentChainID,
    getWallet
} = require("./helper");
const { getTotalDepositedValueOnChain } = require("./getDeposited");

async function redeem(chainId, tokenSymbol, amountToRedeem) {
    const avalancheFujiChainId = 43113;
    const wallet = getWallet(avalancheFujiChainId);
    const MAIN_ROUTER_ADDRESS = NetworkInfomation[chainId].MAIN_ROUTER_ADDRESS;
    const mainRouterContract = new Contract(MAIN_ROUTER_ADDRESS, MainRouterABI, wallet);
    const totalDepositedOnChain = await getTotalDepositedValueOnChain(chainId);
    console.log(totalDepositedOnChain);

    // console.log(depositedOnChain);
    // console.log(amountToBurn);
    // if (totalMintedOnchainFormat < amountToBurn) {
    //     return null;
    // }

    const tokenAddress = NetworkInfomation[chainId]["TOKEN"][tokenSymbol].address;
    // await approveToken(tokenAddress, amountToRedeem, chainId);

    const gasLimit = ethers.utils.hexlify(1000000);
    const value = ethers.utils.parseEther("0.1");
    const amountToRedeemInWei = ethers.utils.parseUnits(amountToRedeem, 18);
    const CHAIN_SELECTOR = NetworkInfomation[chainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[chainId].DEPOSITOR_ADDRESS
    const tx = await mainRouterContract.redeem(CHAIN_SELECTOR, receiverAddress, tokenAddress, amountToRedeemInWei, {
        gasLimit: gasLimit,
        value: value
    });
    await tx.wait();
    console.log(`Redeemed with transaction hash: ${tx.hash}`);
}

module.exports = {
    redeem,
}