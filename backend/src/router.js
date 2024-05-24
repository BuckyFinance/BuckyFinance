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

router.get('/getDepositedEachToken', async (req, res) => {
    const { chainId, tokenSymbol, isValue } = req.query;
    const { getDepositedEachChainEachToken, getDepositedEachChainEachTokenValue } = require("../scripts/getDeposited");
    let deposited;
    if (isValue == 'true') {
        deposited = await getDepositedEachChainEachTokenValue(chainId, tokenSymbol);
    } else {
        deposited = await getDepositedEachChainEachToken(chainId, tokenSymbol);
    }
    res.status(200).json(deposited);
})

router.get('/getTotalDeposited', async (req, res) => {
    const { chainId } = req.query;
    const { getTotalDepositedEachChainValue } = require("../scripts/getDeposited");
    const deposited = await getTotalDepositedEachChainValue(chainId);
    res.status(200).json(deposited);
})

router.get('/getMaxOutput', async (req, res) => {
    const { getMaxOutput } = require("../scripts/getMaxOutput");
    const maxOutput = await getMaxOutput();
    res.status(200).json(maxOutput);
})

router.get('/getMinted', async (req, res) => {
    const { getMinted } = require("../scripts/getMinted");
    const minted = await getMinted();
    res.status(200).json(minted);
})

router.get('/getHealthFactor', async (req, res) => {
    const { getHealthFactor } = require("../scripts/getHealthFactor");
    const healthFactor = await getHealthFactor();
    res.status(200).json(healthFactor);
})

router.get('/getPriceFeeds', async (req, res) => {
    const { chainId, tokenSymbol } = req.query;
    const { getPriceFeeds } = require("../scripts/getPriceFeeds");
    const priceFeeds = getPriceFeeds(chainId, tokenSymbol);
    res.status(200).json(priceFeeds);
})

module.exports = router