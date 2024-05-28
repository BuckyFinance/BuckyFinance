import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;    

console.log(API_BASE_URL);
export const useDeposited = (tokenList, walletAddress, chainId) => {
    const [tokenDeposited, setTokenDeposited] = useState(tokenList);
    const [totalCollateralValueOnChain, setTotalCollateralValueOnChain] = useState(0);

    const getDeposited =  async () => {
        const promises = tokenList.map(({ticker}) => axios.get(`${API_BASE_URL}/api/v1/getDepositedEachToken`, {
            params: {
                chainId: chainId,
                tokenSymbol: ticker,
                isValue: false,
                walletAddress: walletAddress,
            }
        }));
        const deposited = await Promise.all(promises);
        setTokenDeposited(tokenList.map((token, index) => ({
            ...token,
            deposited: deposited[index].data,
        })));

    }

    const getTotalCollateralValue = async() => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/getTotalDepositedOnChain`, {
            params: {
                chainId: chainId,
                walletAddress: walletAddress,
            }
        });
        setTotalCollateralValueOnChain(parseFloat(response.data));
    }

    useEffect(() => {
        getDeposited();
        getTotalCollateralValue();
    }, [chainId, walletAddress]);

    return { tokenDeposited, totalCollateralValueOnChain};
}