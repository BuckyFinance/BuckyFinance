import React, {useState, useEffect} from 'react'
import {Input, Popover, Radio, Modal, message} from "antd"
import {
	ArrowDownOutLined,
	DownOutlined,
	SmileOutlined,
	SettingOutlined,
	PlusOutlined,
	CaretDownOutlined,
	ArrowRightOutlined,
	LoadingOutlined
} from "@ant-design/icons"
import { Row, Col, Flex, Space, Dropdown } from 'antd';

import chainList from "../tokenList.json"
import { textAlign } from '@mui/system';
import { useSwitchChain } from 'wagmi'
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import {useTx} from "../hooks/useWriteTx.js"
import { Spin } from 'antd';
import { useBalance } from '../hooks/useMinted.js';
import { depositAndMint, getMaxCanBeMinted } from '../backend/scripts/depositAndMint.js';
import "../App.css";
import LoadingAnimation from '../loading.js';

const tokenList = [];

function QuickBorrow(props) {
    const tokenList = chainList[0].tokens;
    const [depositChain, setDepositChain] = useState(chainList[0]);
	const [borrowChain, setBorrowChain] = useState(chainList[0]);
	const [swapAmount, setSwapAmount] = useState(null);
	const {account} = props;
	const {chains, switchChain} = useSwitchChain();
    const [depositAmount, setDepositAmount] = useState(NaN);
    const [borrowAmount, setBorrowAmount] = useState(null);
    // const defaultToken = {
        //     "ticker": "WBTC",
        //     "img": "https://cdn.moralis.io/eth/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png",
        //     "name": "Wrapped Bitcoin",
        //     "address": "0x4aa3B1639d45Cb98a67790b8509E47bD7aa16D2A",
        //     "decimals": 8
        // },
    const [depositToken, setDepositToken] = useState(tokenList[0]);
    const [maxCanBeMinted, setMaxCanBeMinted] = useState(0);
    const {balance, setBalance} = useBalance(depositChain.chainID, depositToken.ticker, account.address);



	const {isError, isPending , isSuccess,isLoading, status, txHash, confirmationState, setConfirmationState, setTxHash, executeTx} = useTx('depositAndMint', borrowChain.chainID, depositToken.ticker, depositAmount, account.address, borrowAmount);

	
	
	function FilterInput(event) {
		var keyCode = ('which' in event) ? event.which : event.keyCode;
	
		var isNotWanted = (keyCode == 69 || keyCode == 101);
		if(isNotWanted){
			event.stopPropagation();
			event.preventDefault();
		}
	};
	function handlePaste (e) {
		var clipboardData, pastedData;
	
		// Get pasted data via clipboard API
		clipboardData = e.clipboardData || window.clipboardData;
		pastedData = clipboardData.getData('Text').toUpperCase();
	
		if(pastedData.indexOf('E')>-1) {
			//alert('found an E');
			e.stopPropagation();
			e.preventDefault();
		}
	};

    async function _setMaxCanBeMinted(){
		setMaxCanBeMinted(await getMaxCanBeMinted(depositToken.ticker, depositAmount, 0, account.address));
    }

    useEffect(() => {
        _setMaxCanBeMinted();

		const intervalId = setInterval(_setMaxCanBeMinted, 500); 

		return () => clearInterval(intervalId);
    }, [depositToken, depositAmount]);


	async function changeDepositAmount(e){
        setDepositAmount(parseFloat(e.target.value));
	}

    async function changeBorrowAmount(e){
        setBorrowAmount(parseFloat(e.target.value));
	}

	const ColorButton = styled(Button)(({ theme }) => ({
		color: '#5981F3',
		fontWeight: 'bold',
		backgroundColor: '#243056',
		'&:hover': {
		  backgroundColor: '#3b4874',
		},
		'&:disabled': {
			backgroundColor: '#243056',
			opacity: '0.4',
			color: '#5982f39b',
		}
	}));

	const [messageApi, contextHolder] = message.useMessage();

	useEffect(() => {
		if(confirmationState == 'rejected'){
			messageApi.destroy();
			messageApi.open({
				type: 'error',
				content: 'Transaction Rejected!',
				duration: 1.5,
			});
			setConfirmationState('none');
		}else if(confirmationState == 'confirmed'){
			setConfirmationState('none');
		}
	}, [confirmationState]);

	useEffect(() => {
		if(txHash && isPending){
			messageApi.destroy();
			messageApi.open({
				type: 'loading',
				content: 'Transaction is Pending...',
				duration: 0,
			});
		}else if(isSuccess){
			messageApi.destroy();
			messageApi.open({
				type: 'success',
				content: 'Transaction Successful!',
				duration: 1.5,
			});
			setTxHash(null);
			setBorrowAmount(NaN);
            setDepositAmount(NaN);
		}else if(status == "error"){
			messageApi.destroy();
			messageApi.open({
				type: 'error',
				content: 'Transaction Failed!',
				duration: 1.5,
			});
			setTxHash(null);
		}
	}, [isPending,  isLoading]);

    const depositChainDropdown = chainList.map((chain, index) => (
        {
            key: index.toString(),
            label: (
                <div className='dropdownChoice' onClick={() => {setBalance(NaN);setDepositChain(chain)}}>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px'}}>
                        <img src={chainList[index].img} alt="assetOneLogo" className='assetLogo' />
                    </div>
                    <div>
                        {chainList[index].chainName}
                    </div>
                </div>
            ),
        }
    ));

	const borrowChainDropdown = chainList.map((chain, index) => (
        {
            key: index.toString(),
            label: (
                <div className='dropdownChoice' onClick={() => setBorrowChain(chain)}>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px'}}>
                        <img src={chainList[index].img} alt="assetOneLogo" className='assetLogo' />
                    </div>
                    <div>
                        {chainList[index].chainName}
                    </div>
                </div>
            ),
        }
    ));

    const tokenDropdown = tokenList.map((token, index) => (
        {
            key: index.toString(),
            label: (
                <div className='dropdownChoice' onClick={() => {setBalance(NaN); setDepositToken(token)}}>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px'}}>
                        <img src={token.img} alt="assetOneLogo" className='assetLogo' />
                    </div>
                    <div>
                        {token.name}
                    </div>
                </div>
            ),
        }
    ));

    const dalUSD = {
		"ticker": "DSC",
		"img": "https://cryptologos.cc/logos/versions/dogecoin-doge-logo-alternative.svg?v=032",
		"name": "Duc Anh Le USD",
		"address": "0xDFf5Ba9FCff83cE455e45De7572B6259b0E7D7dE",
		"decimals": 6
	};

	
	
  	return (
		<>
		    {contextHolder}
            <div className='borrowBox'>
                <div className='tradeBoxHeader'>
                    <h2>Quick Borrow</h2>
                </div>
                <div className='rowRowRowRow' style={{marginTop: 10}}>
                    <div className='subBorrowBox' style={{marginRight: 16}}>
                        <div className='subBorrowBoxHeader'>
                            <div style={{fontSize:'x-large', fontWeight: 600}}>Deposit</div>
                            <Dropdown menu={{items: depositChainDropdown,}}>
								<div className='dropdown' style={{fontSize: 20}}>
										<img src={depositChain.img} alt="assetOneLogo" className='assetLogo'></img>
										{depositChain.chainName}
										<CaretDownOutlined></CaretDownOutlined>
								</div>
							</Dropdown>
                        </div>
                        <div className='inputs' style={{marginTop: 12}}>
							<input value={depositAmount} placeholder='0.0' onChange={(e) => changeDepositAmount(e)}type='number' onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)} style={{paddingRight: 100}} className='value-input-6'></input>
                            <Dropdown menu={{items: tokenDropdown,}}>
                                <div className='assetOne' style={{fontSize: 14, fontWeight: 600}}>
                                    <img src={depositToken.img} alt="assetOneLogo" className='assetLogo' style={{height: 24}}></img>
                                    {depositToken.ticker}
                                    <CaretDownOutlined></CaretDownOutlined>
                                </div>
                            </Dropdown>
						</div>
                        <div style={{color: 'gray', marginTop: 10}}>
                            Max: {balance == balance && balance.toFixed(2)} {balance != balance && <LoadingAnimation/>}• <span style={{color: '#5981F3'}} onClick={() => setDepositAmount(balance)}> USE MAX</span>
                        </div>
                    </div>
                    <div className='subBorrowBox' style={{marginLeft: 16}}>
                        <div className='subBorrowBoxHeader'>
                            <div style={{fontSize:'x-large', fontWeight: 600}}>Borrow</div>
                            <Dropdown menu={{items: borrowChainDropdown,}}>
								<div className='dropdown' style={{fontSize: 20}}>
										<img src={borrowChain.img} alt="assetOneLogo" className='assetLogo'></img>
										{borrowChain.chainName}
										<CaretDownOutlined></CaretDownOutlined>
								</div>
							</Dropdown>
                        </div>
                        <div className='inputs' style={{marginTop: 12}}>
							<input value={borrowAmount} placeholder='0.0' onChange={(e) => changeBorrowAmount(e)}type='number' onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)} style={{paddingRight: 100}} className='value-input-6'></input>
							<div className='assetOne' style={{fontSize: 14, fontWeight: 600}}>
								<img src={dalUSD.img} alt="assetOneLogo" className='assetLogo' style={{height: 24}}></img>
								{dalUSD.ticker}
							</div>
						</div>
                        <div style={{color: 'gray', marginTop: 10}}>
                            Max: {maxCanBeMinted.toFixed(2)} • <span style={{color: '#5981F3'}} onClick={() => setBorrowAmount(maxCanBeMinted)}> USE MAX</span>
                        </div>
                    </div>
                </div>
                {(depositChain.chainID != account.chainId) &&
                    <div style={{marginTop: '16px'}} className='swapButton' onClick={() => switchChain({chainId: depositChain.chainID})}>Switch to {depositChain.chainName}</div>
                }

                {(confirmationState != 'confirming' && depositChain.chainID == account.chainId) &&
                    <div style={{marginTop: '16px'}} className='swapButton' disabled={balance < depositAmount || borrowAmount > maxCanBeMinted || !borrowAmount || !depositAmount || borrowAmount == 0 || depositAmount == 0} onClick={() => executeTx()}>Deposit and Borrow</div>
                }

                {(confirmationState == 'confirming' && depositChain.chainID == account.chainId) &&
                    <div style={{marginTop: '16px'}} className='swapButton' disabled={true} ><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>
                }	
                </div>
		</>
    )
}


export default QuickBorrow;