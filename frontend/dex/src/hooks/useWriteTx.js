import { useEffect, useState } from 'react';
import {mint} from "../backend/scripts/mint.js"
import {deposit} from "../backend/scripts/deposit.js"
import {burn} from "../backend/scripts/burn.js"
import {redeem} from "../backend/scripts/redeem.js"
import {ethers} from 'ethers'
import { useWaitForTransactionReceipt } from 'wagmi';  
export const useTx = (action, chainId, tokenSymbol, amount, walletAddress) => {
    const [signer, setSigner] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const { isError, isPending, isLoading, status} = useWaitForTransactionReceipt({
        hash: txHash
    })

    async function getSigner() {
		const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
		const signer =  provider.getSigner();
		const res = await provider.send("eth_requestAccounts", []);
		const address = await signer.getAddress();
		return signer;
	}

    const executeTx =  async () => {
        console.log(action, chainId, tokenSymbol, amount, walletAddress);
        if(action == 'mint'){
            setTxHash(await mint(chainId, amount, signer, true));
        }else if(action == 'deposit'){
            setTxHash(await deposit(tokenSymbol, amount, signer, true));
        }else if(action == 'burn'){
            setTxHash(await burn(chainId, amount, signer, true));
        }else if(action == 'withdraw'){
            setTxHash(await redeem(chainId, tokenSymbol, amount, signer, true));
        }
    }

    const _getSigner = async () => {
        setSigner(await getSigner());
    }

    useEffect(() => {
        console.log(isError, isPending, isLoading, txHash);
        _getSigner();
    }, [walletAddress, chainId]);

    return { isError, isPending  , isLoading, status, txHash, executeTx };
}
