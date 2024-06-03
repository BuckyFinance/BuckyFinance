import { useEffect, useState } from 'react';
import {mint} from "../backend/scripts/mint.js"
import {deposit} from "../backend/scripts/deposit.js"
import {burn} from "../backend/scripts/burn.js"
import {redeem} from "../backend/scripts/redeem.js"
import { depositAndMint } from '../backend/scripts/depositAndMint.js';
import { burnAndMint } from '../backend/scripts/burnAndMint.js';
import {ethers} from 'ethers'
import { useWaitForTransactionReceipt } from 'wagmi';  
export const useTx = (action, chainId, tokenSymbol, amount, walletAddress, amount2) => {
    const [signer, setSigner] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const { isError, isSuccess, isPending, isLoading, status} = useWaitForTransactionReceipt({
        hash: txHash
    })
    const [confirmationState, setConfirmationState] = useState('none');

    async function getSigner() {
		const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
		const signer =  provider.getSigner();
		const res = await provider.send("eth_requestAccounts", []);
		const address = await signer.getAddress();
		return signer;
	}

    const executeTx =  async () => {
        console.log("Call", action, chainId, tokenSymbol, amount, walletAddress, amount2);
        setConfirmationState('confirming');
        try{
            if(action == 'Borrow'){
                setTxHash(await mint(chainId, amount, signer, true));
            }else if(action == 'Deposit'){
                setTxHash(await deposit(tokenSymbol, amount, signer, true));
            }else if(action == 'Repay'){
                setTxHash(await burn(chainId, amount, signer, true));
            }else if(action == 'Withdraw'){
                setTxHash(await redeem(chainId, tokenSymbol, amount, signer, true));
            }else if(action == 'swap'){
                setTxHash(await burnAndMint(amount, chainId, signer, true))
            }else if(action == 'depositAndMint'){
                setTxHash(await depositAndMint(tokenSymbol, amount, chainId, amount2, signer, true));
            }
            setConfirmationState('confirmed');
        }catch{
            setConfirmationState('rejected');
        }
    }

    const _getSigner = async () => {
        setSigner(await getSigner());
    }

    useEffect(() => {
        console.log(isError, isPending, isLoading, txHash);
        _getSigner();
    }, [walletAddress, chainId]);

    return { isError, isPending , isSuccess , isLoading, status, txHash, confirmationState, setConfirmationState, setTxHash, executeTx };
}
