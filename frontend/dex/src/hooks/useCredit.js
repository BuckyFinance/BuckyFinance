import { useEffect, useState } from "react";
import {getTotalCreditScore} from "../backend/scripts/getCreditScore.js"

export const useCredit = (walletAddress) => {
    const [creditScore, setCreditScore] = useState(299.999);
    const [creditStatus, setCreditStatus] = useState('none');

    const calculateCredit = async () => {
        setCreditStatus('calculating');

        setCreditScore(await getTotalCreditScore(walletAddress));

        setCreditStatus('calculated');
    }

    return {creditScore, creditStatus, setCreditStatus, calculateCredit};
}