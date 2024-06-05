const { ethers, Contract } = require("ethers")
const NetworkInfomation = require("../src/NetworkInfomation.json");
const ERC20MockABI = require("../abi/ERC20Mock.json");
const {
    getWallet,
    getWalletAddress,
    getProvider,
} = require("./helper")

async function getBalance(chainId, tokenSymbol, walletAddress) {
    const provider = getProvider(chainId);
    const tokenInfo = NetworkInfomation[chainId]["TOKEN"][tokenSymbol];
    const tokenAddress = tokenInfo.address;
    const tokenDecimals = tokenInfo.decimals;
    const tokenContract = new Contract(tokenAddress, ERC20MockABI, provider);
    const balance = await tokenContract.balanceOf(walletAddress);
    const balanceFormat = ethers.utils.formatUnits(balance, tokenDecimals);
    //console.log(`Balance of Token ${tokenSymbol} with Address ${walletAddress}: ${balanceFormat}`);
    return balanceFormat;
}

async function main() {
    const walletAddress = "0xB1A296a720D9AAF5c5e9F805d8095e6d94882eE1";
    const chainId = 84532;
    const wbtcBalance = await getBalance(chainId, "WBTC", walletAddress);
    const wethBalance = await getBalance(chainId, "WETH", walletAddress);
    const uniBalance = await getBalance(chainId, "UNI", walletAddress);
    const usdcBalance = await getBalance(chainId, "USDC", walletAddress);
    const usdtBalance = await getBalance(chainId, "USDT", walletAddress);
    const linkBalance = await getBalance(chainId, "LINK", walletAddress);
}

// main();

module.exports = {
    getBalance,
}