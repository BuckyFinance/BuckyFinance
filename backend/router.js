const express = require('express')
const router = express.Router()


router.get('/deposit', async (req, res) => {
    const { tokenSymbol, amountIn } = req.query;
    const { deposit } = require("./scripts/deposit");
    await deposit(tokenSymbol, amountIn);
    res.status(200).json("deposited");

})



module.exports = router