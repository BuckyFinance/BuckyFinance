import { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;    

export const useTotalCollateralValue = (walletAddress) => {
    const [totalCollateralValue, setTotalCollateralValue] = useState(0);
    const getTotalCollateralValue =  async () => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/getTotalDepositedOverralChain`, {
            params: {
                walletAddress: walletAddress,
            }
        });
        setTotalCollateralValue(parseFloat(response.data));

    }
    useEffect(() => {
        getTotalCollateralValue()
    }, [walletAddress]);

    return { totalCollateralValue };
}


export const useTotalMintedValue = (walletAddress) => {
    const [totalMintedValue, setTotalMintedValue] = useState(0);
    const getTotalMintedValue =  async () => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/getTotalMintedValueOverallChain`, {
            params: {
                walletAddress: walletAddress,
            }
        });
        setTotalMintedValue(parseFloat(response.data));

    }
    useEffect(() => {
        getTotalMintedValue()
    }, [walletAddress]);

    return { totalMintedValue };
}
