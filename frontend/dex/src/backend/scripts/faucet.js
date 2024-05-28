const { Contract, ethers } = require("ethers");
const ERC20MockABI = require("../abi/ERC20Mock.json");
const NetworkInfomation = require("../src/NetworkInfomation.json");
const {
    getWallet
} = require("./helper");

async function mintToken(chainId, tokenSymbol, amountToMint) {
    const wallet = getWallet(chainId);
    const tokenInfo = NetworkInfomation[chainId]["TOKEN"][tokenSymbol];
    const tokenAddress = tokenInfo.address;
    const tokenDecimals = tokenInfo.decimals;
    const tokenContract = new Contract(tokenAddress, ERC20MockABI, wallet);

    const walletAddress = await wallet.getAddress();
    const amountToMintInWei = ethers.utils.parseUnits(amountToMint.toString(), tokenDecimals);
    const tx = await tokenContract.mint(walletAddress, amountToMintInWei);
    console.log(`Mint token on chain ${chainId}, amount: ${amountToMint} with tx hash: ${tx.hash}`);
}

async function main() {
    mintToken("11155111", "UNI", 50);
    mintToken("11155420", "UNI", 50);
    mintToken("421614", "UNI", 50);
    mintToken("43113", "UNI", 50);
    mintToken("80002", "UNI", 50);
    mintToken("84532", "UNI", 50);
}

main();

module.exports = {
    mintToken,
}