const express = require('express')
const router = express.Router()


router.get('/deposit', async (req, res) => {
    const { tokenSymbol, amountIn } = req.query;
    const { deposit } = require("./scripts/deposit");
    await deposit(tokenSymbol, amountIn);
    res.status(200).json("deposited");
})

router.get('/getDepositedEachToken', async (req, res) => {
    const { chainId, tokenSymbol } = req.query;
    const { getDepositedEachChainEachToken } = require("./scripts/getDeposited");
    const deposited = await getDepositedEachChainEachToken(chainId, tokenSymbol);
    res.status(200).json(deposited);
})

router.get('/getTotalDeposited', async (req, res) => {
    const { chainId } = req.query;
    const { getTotalDepositedEachChainValue } = require("./scripts/getDeposited");
    const deposited = await getTotalDepositedEachChainValue(chainId);
    res.status(200).json(deposited);
})



module.exports = router