const { ethers, Contract } = require('ethers');
const DepositorABI = require("../abi/Depositor.json");
const ERC20MockABI = require("../abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
} = require("./helper");

async function depositFeePay(amount, signerFromFE, isCalledFromFE) {
    const avalancheFujiChainId = 43113;
    let wallet;
    if (isCalledFromFE == true) {
        wallet = signerFromFE;
    } else {
        wallet = getWallet(avalancheFujiChainId);
    }
    const mainRouterAddress = NetworkInfomation[avalancheFujiChainId].MAIN_ROUTER_ADDRESS;
    const value = ethers.utils.parseEther(amount);
    const tx = await wallet.sendTransaction({
        to: mainRouterAddress,
        value: value,
    });

    //  await tx.wait();
    console.log(`Deposited fee pay with tx hash: ${tx.hash}`);
    return tx.hash;
}

async function main() {
    await depositFeePay("0.5", "", false);
}

// main();

module.exports = {
    depositFeePay
}