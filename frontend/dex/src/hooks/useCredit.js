import { useEffect, useState } from "react";
import {getTotalCreditScore} from "../backend/scripts/getCreditScore.js"
import { requestCreditScore } from "../backend/scripts/requestCreditScore.js";
import {ethers} from 'ethers'

export const useCredit = (walletAddress) => {
    const [creditScore, setCreditScore] = useState(299.999);
    const [creditStatus, setCreditStatus] = useState('none');

    async function getSigner() {
		const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
		const signer =  provider.getSigner();
		const res = await provider.send("eth_requestAccounts", []);
		const address = await signer.getAddress();
		return signer;
	}

    const calculateCredit = async () => {
        setCreditStatus('calculating');

        await requestCreditScore(await getSigner(), true);
        setCreditScore(await getTotalCreditScore(walletAddress));

        setCreditStatus('calculated');
    }

    return {creditScore, creditStatus, setCreditStatus, calculateCredit};
}