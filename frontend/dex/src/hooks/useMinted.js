import { useEffect, useState } from 'react';
import axios from 'axios';
import { etherUnits } from 'viem';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;    

console.log(API_BASE_URL);
export const useMinted = (walletAddress, chainId) => {
    const [tokenMinted, setTokenMinted] = useState(0);
    const getMinted =  async () => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/getTotalMintedOnChain`, {
            params: {
                chainId: chainId,
                walletAddress: walletAddress,
            }
        });
        setTokenMinted(parseFloat(response.data));

    }
    useEffect(() => {
        getMinted()
    }, [chainId, walletAddress]);

    return { tokenMinted };
}