import { useEffect, useState } from 'react';
import axios from 'axios';
import {getDepositedAmount,getTotalDepositedValueOnChain} from "../backend/scripts/getDeposited.js"
import { getBalance } from '../backend/scripts/getBalance.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;    
const FETCH_INTERVAL = process.env.REACT_APP_FETCH_INTERVAL

export const useDeposited = (tokenList, walletAddress, chainId) => {
    const [tokenDeposited, setTokenDeposited] = useState(tokenList);
    const [totalCollateralValueOnChain, setTotalCollateralValueOnChain] = useState(NaN);

    const getData = async(ticker, chainId) => {
        return [await getDepositedAmount(chainId, ticker, walletAddress), await getBalance(chainId, ticker, walletAddress)]
    }

    const getDeposited =  async (_chainId) => {
        const promises = tokenList.map(({ticker}) => getData(ticker, _chainId));
        const deposited = await Promise.all(promises);

        if(chainId == _chainId)
        setTokenDeposited(tokenList.map((token, index) => ({
            ...token,
            deposited: deposited[index][0],
            inWallet: deposited[index][1],
        })));
    }

    const getTotalCollateralValue = async(_chainId) => {
        console.log(_chainId);
        const response = await getTotalDepositedValueOnChain(_chainId, walletAddress);
        if(_chainId == chainId)
        setTotalCollateralValueOnChain(parseFloat(response));
    }

    const fetchData = () => {
        getDeposited(chainId);
        getTotalCollateralValue(chainId);
    }

    useEffect(() => {
        fetchData();

        const intervalId = setInterval(fetchData, FETCH_INTERVAL); 
        
        return () => clearInterval(intervalId);
    }, [chainId, walletAddress]);

    return { tokenDeposited, totalCollateralValueOnChain, setTokenDeposited, setTotalCollateralValueOnChain };
}