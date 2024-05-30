import { useEffect, useState } from 'react';
import {getTotalMintedValueOverallChain} from "../backend/scripts/getMinted.js"
import {getTotalDepositedValueOverallChain} from "../backend/scripts/getDeposited.js"
  
export const useTotalCollateralValue = (walletAddress) => {
    const [totalCollateralValue, setTotalCollateralValue] = useState(0);
    const getTotalCollateralValue =  async () => {
        const response = await getTotalDepositedValueOverallChain(walletAddress);
        setTotalCollateralValue(parseFloat(response));

    }
    useEffect(() => {
        getTotalCollateralValue()
    }, [walletAddress]);

    return { totalCollateralValue };
}


export const useTotalMintedValue = (walletAddress) => {
    const [totalMintedValue, setTotalMintedValue] = useState(0);
    const getTotalMintedValue =  async () => {
        const response = await getTotalMintedValueOverallChain(walletAddress);
        setTotalMintedValue(parseFloat(response));

    }
    useEffect(() => {
        getTotalMintedValue()
    }, [walletAddress]);

    return { totalMintedValue };
}
