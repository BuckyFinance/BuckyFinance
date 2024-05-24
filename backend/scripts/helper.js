const { ethers } = require("ethers")
require("dotenv").config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL;
const AMOY_RPC_URL = process.env.AMOY_RPC_URL;
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL;
const FUJI_RPC_URL = process.env.FUJI_RPC_URL;
const BASE_RPC_URL = process.env.BASE_RPC_URL;

let currentChainID = 84532;
let currentRpcURl = BASE_RPC_URL

function getProvider() {
    return new ethers.providers.JsonRpcProvider(currentRpcURl);
}

function getWallet() {
    const provider = getProvider();
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

async function switchChain(newChainId) {
    currentChainID = newChainId;
    if (currentChainID === 11155111) {
        currentRpcURl = SEPOLIA_RPC_URL;
    } else if (currentChainID === 421614) {
        currentRpcURl = ARBITRUM_RPC_URL;
    } else if (currentChainID === 80002) {
        currentRpcURl = AMOY_RPC_URL;
    } else if (currentChainID === 11155420) {
        currentRpcURl = OPTIMISM_RPC_URL;
    } else if (currentChainID === 43113) {
        currentRpcURl = FUJI_RPC_URL;
    } else if (currentChainID == 84532) {
        currentRpcURl = BASE_RPC_URL;
    }
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
    switchChain,
}