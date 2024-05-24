const { ethers } = require("ethers")
require("dotenv").config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL;
const AMOY_RPC_URL = process.env.AMOY_RPC_URL;
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL;
const FUJI_RPC_URL = process.env.FUJI_RPC_URL;
const BASE_RPC_URL = process.env.BASE_RPC_URL;

let currentChainID = 421614;

function getProvider(rpcUrl) {
    return new ethers.providers.JsonRpcProvider(rpcUrl);
}

function getWallet(chainId) {
    const rpcUrl = getRpcUrl(chainId);
    const provider = getProvider(rpcUrl);
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
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
    currentChainID = chainId;
}

async function getCurrentChainId() {
    const provider = getProvider();

    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const networkName = network.name;

    return chainId;
}

module.exports = {
    currentChainID,
    getProvider,
    getWallet,
    getCurrentChainId,
    switchCurrentChainId,
}