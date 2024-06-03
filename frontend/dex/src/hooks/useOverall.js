import { useEffect, useState } from 'react';
import {getTotalMintedValueOverallChain} from "../backend/scripts/getMinted.js"
import {getTotalDepositedValueOverallChain} from "../backend/scripts/getDeposited.js"
  
const FETCH_INTERVAL = process.env.REACT_APP_FETCH_INTERVAL;

export const useTotalCollateralValue = (walletAddress) => {
    const [totalCollateralValue, setTotalCollateralValue] = useState(0);
    const getTotalCollateralValue =  async () => {
        const response = await getTotalDepositedValueOverallChain(walletAddress);
        setTotalCollateralValue(parseFloat(response));

    }

    useEffect(() => {
        const fetchData = () => {
            getTotalCollateralValue()
        }

        fetchData();

        const intervalId = setInterval(fetchData, FETCH_INTERVAL); 
        
        return () => clearInterval(intervalId);
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
        const fetchData = () => {
            getTotalMintedValue()
        }

        fetchData();

        const intervalId = setInterval(fetchData, FETCH_INTERVAL); 
        
        return () => clearInterval(intervalId);
    }, [walletAddress]);

    return { totalMintedValue };
}
