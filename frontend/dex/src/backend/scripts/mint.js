const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const MainRouterABI = require("../abi/MainRouter.json");
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

// must to move to avalanche before call mint
async function mint(desChainId, amountOut, signerFromFE, isCalledFromFE) {
    const avalancheFujiChainId = 43113;
    let wallet;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
    } else {
        wallet = getWallet(avalancheFujiChainId);
    }
    const walletAddress = await wallet.getAddress();

    const CHAIN_SELECTOR = NetworkInfomation[desChainId].CHAIN_SELECTOR;
    const receiverAddress = NetworkInfomation[desChainId].MINTER_ADDRESS;
    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;

    const mainRouterContract = new Contract(mainRouterAddress, MainRouterABI, wallet);
    const amountOutInWei = ethers.utils.parseUnits(amountOut, 18);
    const gasLimit = ethers.utils.hexlify(1000000);
    const value = await getMintFeeOnChain(mainRouterContract, CHAIN_SELECTOR, receiverAddress, amountOutInWei);
    // const value = ethers.utils.parseEther("0.02");
    const canBeMinted = parseFloat(await getMaxOutputCanBeMinted(walletAddress));

    // console.log(canBeMinted);
    // console.log(amountOut);

    if (canBeMinted < amountOut) {
        return null;
    }

    const tx = await mainRouterContract.mint(CHAIN_SELECTOR, receiverAddress, amountOutInWei, {
        value: value,
    });
    //await tx.wait();
    console.log(`Minted on chain ${desChainId} with tx hash: ${tx.hash}`);
    return tx.hash;
}

async function main() {
    const chainIdDestination = 421614;
    await mint(80002, "2", "", false);
}

//main();

module.exports = {
    mint,
}