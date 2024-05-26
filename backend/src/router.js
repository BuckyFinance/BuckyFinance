const express = require('express')
const router = express.Router()


router.get('/deposit', async (req, res) => {
    const { tokenSymbol, amountIn } = req.query;
    const { deposit } = require("../scripts/deposit");
    await deposit(tokenSymbol, amountIn);
    res.status(200).json("deposited");
})

router.get('/mint', async (req, res) => {
    const { chainId, amountOut } = req.query;
    const { mint } = require("../scripts/mint");
    await mint(chainId, amountOut);
    res.status(200).json("minted");
})

router.get('/burn', async (req, res) => {
    const { chainId, amountToBurn } = req.query;
    const { burn } = require("../scripts/burn");
    await burn(chainId, amountToBurn);
    res.status(200).json("burned");
})

router.get('/redeem', async (req, res) => {
    const { chainId, tokenSymbol, amountToRedeem } = req.query;
    const { redeem } = require("../scripts/redeem");
    await redeem(chainId, tokenSymbol, amountToRedeem);
    res.status(200).json("redeemed");
})

router.get('/getDepositedEachToken', async (req, res) => {
    const { chainId, tokenSymbol, isValue, walletAddress } = req.query;
    const { getDepositedAmount, getDepositedValue } = require("../scripts/getDeposited");
    let deposited;
    if (isValue == 'true') {
        deposited = await getDepositedValue(chainId, tokenSymbol, walletAddress);
    } else {
        deposited = await getDepositedAmount(chainId, tokenSymbol, walletAddress);
    }
    res.status(200).json(deposited);
})

router.get('/getTotalDepositedOnChain', async (req, res) => {
    const { chainId, walletAddress } = req.query;
    const { getTotalDepositedValueOnChain } = require("../scripts/getDeposited");
    const deposited = await getTotalDepositedValueOnChain(chainId, walletAddress);
    res.status(200).json(deposited);
})

router.get('/getTotalDepositedOverralChain', async (req, res) => {
    const { walletAddress } = req.query;
    const { getTotalDepositedValueOverallChain } = require("../scripts/getDeposited");
    const deposited = await getTotalDepositedValueOverallChain(walletAddress);
    res.status(200).json(deposited);
})

router.get('/getMaxOutput', async (req, res) => {
    const { getMaxOutputCanBeMinted } = require("../scripts/getMaxOutput");
    const maxOutput = await getMaxOutputCanBeMinted();
    res.status(200).json(maxOutput);
})

router.get('/getTotalMintedOnChain', async (req, res) => {
    const { chainId, walletAddress } = req.query;
    const { getTotalMintedValueOnChain } = require("../scripts/getMinted");
    const minted = await getTotalMintedValueOnChain(chainId, walletAddress);
    res.status(200).json(minted);
})

router.get('/getTotalMintedValueOverallChain', async (req, res) => {
    const { walletAddress } = req.query;
    const { getTotalMintedValueOverallChain } = require("../scripts/getMinted");
    const minted = await getTotalMintedValueOverallChain(walletAddress);
    res.status(200).json(minted);
})

router.get('/getHealthFactor', async (req, res) => {
    const { walletAddress } = req.query;
    const { getHealthFactor } = require("../scripts/getHealthFactor");
    const healthFactor = await getHealthFactor(walletAddress);
    res.status(200).json(healthFactor);
})

router.get('/getFractionToLTV', async (req, res) => {
    const { walletAddress } = req.query;
    const { getFractionToLTV } = require("../scripts/getFractionToLTV");
    const fractionToLTV = await getFractionToLTV(walletAddress);
    res.status(200).json(fractionToLTV);
})

router.get('/getTokenPrice', async (req, res) => {
    const { tokenSymbol } = req.query;
    const { getTokenPrice } = require("../scripts/getTokenPrice");
    const priceFeeds = getTokenPrice(tokenSymbol);
    res.status(200).json(priceFeeds);
})

router.get('/getMaxOutputCanBeMinted', async (req, res) => {
    const { getMaxOutputCanBeMinted } = require("../scripts/getMaxOutput");
    const maxOutput = await getMaxOutputCanBeMinted();
    res.status(200).json(maxOutput);
})

module.exports = router