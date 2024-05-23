const { ethers } = require("hardhat");
const { setBalance } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const RouterAbi = require("../abi/Router.json");
const LinkTokenAbi = require("../abi/LinkToken.json");
const EVM2EVMOnRampAbi = require("../abi/EVM2EVMOnRamp.json");
const EVM2EVMOffRampAbi = require("../abi/EVM2EVMOffRamp.json");

/**
 * Requests LINK tokens from the faucet and returns the transaction hash
 *
 * @param {string} linkAddress The address of the LINK contract on the current network
 * @param {string} to The address to send LINK to
 * @param {bigint} amount The amount of LINK to request
 * @returns {Promise<string>} Promise resolving to the transaction hash of the fund transfer
 */
async function requestLinkFromTheFaucet(linkAddress, to, amount) {
    const LINK_FAUCET_ADDRESS = `0x4281eCF07378Ee595C564a59048801330f3084eE`;
    const linkFaucetImpersonated = await ethers.getImpersonatedSigner(LINK_FAUCET_ADDRESS);

    const linkToken = new ethers.Contract(linkAddress, LinkTokenAbi, ethers.provider);
    const tx = await linkToken.connect(linkFaucetImpersonated).transfer(to, amount);

    return tx.hash;
}

/**
 * Parses a transaction receipt to extract the sent message
 * Scans through transaction logs to find a `CCIPSendRequested` event and then decodes it to an object
 *
 * @param {object} receipt - The transaction receipt from the `ccipSend` call
 * @returns {object | null} Returns either the sent message or null if provided receipt does not contain `CCIPSendRequested` log
 */
function getEvm2EvmMessage(receipt) {
    const evm2EvmOnRampInterface = new ethers.Interface(EVM2EVMOnRampAbi);

    for (const log of receipt.logs) {
        try {
            const parsedLog = evm2EvmOnRampInterface.parseLog(log);
            if (parsedLog?.name == `CCIPSendRequested`) {
                const [
                    sourceChainSelector,
                    sender,
                    receiver,
                    sequenceNumber,
                    gasLimit,
                    strict,
                    nonce,
                    feeToken,
                    feeTokenAmount,
                    data,
                    tokenAmountsRaw,
                    sourceTokenDataRaw,
                    messageId,
                ] = parsedLog?.args[0];
                const tokenAmounts = tokenAmountsRaw.map(([token, amount]) => ({
                    token,
                    amount,
                }));
                const sourceTokenData = sourceTokenDataRaw.map(data => data);
                const evm2EvmMessage = {
                    sourceChainSelector,
                    sender,
                    receiver,
                    sequenceNumber,
                    gasLimit,
                    strict,
                    nonce,
                    feeToken,
                    feeTokenAmount,
                    data,
                    tokenAmounts,
                    sourceTokenData,
                    messageId,
                };
                return evm2EvmMessage;
            }
        } catch (error) {
            return null;
        }
    }

    return null;
}

/**
 * Routes the sent message from the source network on the destination (current) network
 *
 * @param {string} routerAddress - Address of the destination Router
 * @param {object} evm2EvmMessage - Sent cross-chain message
 * @returns {Promise<void>} Either resolves with no value if the message is successfully routed, or reverts
 * @throws {Error} Fails if no off-ramp matches the message's source chain selector or if calling `router.getOffRamps()`
 */
async function routeMessage(routerAddress, evm2EvmMessage) {
    const router = new ethers.Contract(routerAddress, RouterAbi, ethers.provider);

    let offRamps;

    try {
        const offRampsRaw = await router.getOffRamps();
        offRamps = offRampsRaw.map(([sourceChainSelector, offRamp]) => ({ sourceChainSelector, offRamp }));
    } catch (error) {
        throw new Error(`Calling router.getOffRamps threw the following error: ${error}`);
    }

    for (const offRamp of offRamps) {
        if (offRamp.sourceChainSelector == evm2EvmMessage.sourceChainSelector) {
            const evm2EvmOffRamp = new ethers.Contract(offRamp.offRamp, EVM2EVMOffRampAbi);

            const self = await ethers.getImpersonatedSigner(offRamp.offRamp);
            setBalance(self.address, BigInt(100) ** BigInt(18));

            const offchainTokenData = new Array(evm2EvmMessage.tokenAmounts.length).fill("0x");

            await evm2EvmOffRamp.connect(self).executeSingleMessage(evm2EvmMessage, offchainTokenData);

            return;
        }
    }

    throw new Error(`No offRamp contract found, message has not been routed. Check your input parameters please`);
}

module.exports = {
    requestLinkFromTheFaucet,
    getEvm2EvmMessage,
    routeMessage
};
