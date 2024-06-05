import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { etherUnits } from 'viem';
import {getTotalMintedValueOnChain} from "../backend/scripts/getMinted.js"
import {getMaxOutputCanBeMinted} from "../backend/scripts/getMaxOutput.js"
import { getBalance } from '../backend/scripts/getBalance.js';
import { getTokenQueryOptions } from 'wagmi/query';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;    
const FETCH_INTERVAL = process.env.REACT_APP_FETCH_INTERVAL;

export const useMinted = (walletAddress, chainId) => {
    const [tokenMinted, setTokenMinted] = useState(0);
    const [canMint, setCanMint] = useState(0);
    const localChain = useRef(chainId);

    const getMinted =  async (_chainId) => {
        const response = await getTotalMintedValueOnChain(chainId, walletAddress);
        if(_chainId == localChain.current)
        setTokenMinted(parseFloat(response));

    }
    const getCanMint = async() => {
        const response = await getMaxOutputCanBeMinted(walletAddress);
        setCanMint(parseFloat(response));
    }
    useEffect(() => {
        localChain.current = chainId;

        const fetchData = () => {
            getMinted(chainId);
            getCanMint();
        }

        fetchData();

        const intervalId = setInterval(fetchData, 10000); 
        
        return () => clearInterval(intervalId);
    }, [chainId, walletAddress]);

    return { tokenMinted, canMint };
}

export const useBalance = (chainId, tokenSymbol, walletAddress) => {
    const [balance, setBalance] = useState(NaN);
    const localChain = useRef(chainId);
    const localToken = useRef(tokenSymbol);
    
    const _getBalance = async (_chainId, _tokenSymbol) => {
        const response = await getBalance(_chainId, _tokenSymbol, walletAddress);
        if(_chainId == localChain.current && _tokenSymbol == localToken.current)
            setBalance(parseFloat(response));
    }

    useEffect(() => {
        localChain.current = chainId;
        localToken.current = tokenSymbol;

        const fetchData = () => {
            _getBalance(chainId, tokenSymbol);
        }

        fetchData();

        const intervalId = setInterval(fetchData, FETCH_INTERVAL); 
        
        return () => clearInterval(intervalId);
    }, [chainId, walletAddress, tokenSymbol]);

    return {balance, setBalance};
}