import { useEffect, useState } from 'react';
import axios from 'axios';
import { etherUnits } from 'viem';
import {getTotalMintedValueOnChain} from "../backend/scripts/getMinted.js"

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;    

console.log(API_BASE_URL);
export const useMinted = (walletAddress, chainId) => {
    const [tokenMinted, setTokenMinted] = useState(0);
    const getMinted =  async () => {
        const response = await getTotalMintedValueOnChain(chainId, walletAddress);
        setTokenMinted(parseFloat(response));

    }
    useEffect(() => {
        getMinted()
    }, [chainId, walletAddress]);

    return { tokenMinted };
}