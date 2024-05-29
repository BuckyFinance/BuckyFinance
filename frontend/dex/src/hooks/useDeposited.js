import { useEffect, useState } from 'react';
import axios from 'axios';
import {getDepositedAmount,getTotalDepositedValueOnChain} from "../backend/scripts/getDeposited.js"

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;    

console.log(API_BASE_URL);
export const useDeposited = (tokenList, walletAddress, chainId) => {
    const [tokenDeposited, setTokenDeposited] = useState(tokenList);
    const [totalCollateralValueOnChain, setTotalCollateralValueOnChain] = useState(0);

    const getDeposited =  async () => {
        console.log("Hallo");
        const promises = tokenList.map(({ticker}) => getDepositedAmount(chainId, ticker, walletAddress));
        const deposited = await Promise.all(promises);
        setTokenDeposited(tokenList.map((token, index) => ({
            ...token,
            deposited: deposited[index],
        })));
        console.log(deposited);
    }

    const getTotalCollateralValue = async() => {
        const response = await getTotalDepositedValueOnChain(chainId, walletAddress);
        setTotalCollateralValueOnChain(parseFloat(response));
    }

    useEffect(() => {
        getDeposited();
        getTotalCollateralValue();
    }, [chainId, walletAddress]);

    return { tokenDeposited, totalCollateralValueOnChain};
}