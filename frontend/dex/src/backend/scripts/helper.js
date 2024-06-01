const { ethers } = require("ethers")
//require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;
const ARBITRUM_RPC_URL = process.env.REACT_APP_ARBITRUM_RPC_URL;
const AMOY_RPC_URL = process.env.REACT_APP_AMOY_RPC_URL;
const OPTIMISM_RPC_URL = process.env.REACT_APP_OPTIMISM_RPC_URL;
const FUJI_RPC_URL = process.env.REACT_APP_FUJI_RPC_URL;
const BASE_RPC_URL = process.env.REACT_APP_BASE_RPC_URL;

let currentChainID = 84532;

function getProvider(chainId) {
    const rpcUrl = getRpcUrl(chainId);
    return new ethers.providers.JsonRpcProvider(rpcUrl);
}

function getWallet(chainId) {
    const provider = getProvider(chainId);
    const privateKey = process.env.PRIVATE_KEY; // replace with user wallet
    const wallet = new ethers.Wallet(privateKey, provider);
    // console.log(wallet);
    return wallet;
}

function getRpcUrl(chainId) {
    let rpcUrl;
    if (chainId == 11155111) {
        rpcUrl = SEPOLIA_RPC_URL;
    } else if (chainId == 421614) {
        rpcUrl = ARBITRUM_RPC_URL;
    } else if (chainId == 80002) {
        rpcUrl = AMOY_RPC_URL;
    } else if (chainId == 11155420) {
        rpcUrl = OPTIMISM_RPC_URL;
    } else if (chainId == 43113) {
        rpcUrl = FUJI_RPC_URL;
    } else if (chainId == 84532) {
        rpcUrl = BASE_RPC_URL;
    }
    return rpcUrl;
}

function switchCurrentChainId(chainId) {
    console.log("Old chain id: ", currentChainID)
    currentChainID = chainId;
    console.log("New chain id: ", currentChainID)
}

function formatOnChain(amount) {
    const amountFormat = ethers.utils.formatUnits(amount, "ether");
    return amountFormat;
}

function parseOnChain(amount, decimals) {
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    return amountInWei;
}

// async function getCurrentChainId() {
//     const provider = getProvider();

//     const network = await provider.getNetwork();
//     const chainId = network.chainId;
//     const networkName = network.name;

//     return chainId;
// }

function getCurrentChainId() {
    return currentChainID;
}

async function getWalletAddress() {
    const wallet = getWallet();
    const walletAddress = await wallet.getAddress();
    return walletAddress;
}

function getNameOfDecimals(decimals) {
    if (decimals == 6) {
        return "mwei";
    } else {
        return "ether";
    }
}

async function main() {
    getWallet(11155111);
}

// main();

module.exports = {
    getProvider,
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
    getWalletAddress,
    getNameOfDecimals,
}