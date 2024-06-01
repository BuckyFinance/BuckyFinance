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
import { Spin } from 'antd';

import chainList from "../tokenList.json"
import "./Swap.css"
import { textAlign } from '@mui/system';
import { useSwitchChain } from 'wagmi'
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTx } from '../hooks/useWriteTx';
import { useBalance } from '../hooks/useMinted';
import LoadingAnimation from '../loading';

const tokenList = [];

function Swap(props) {
	const [slippage, setSlippage] = useState(2.5);
	const [tokenOneAmount, setTokenOneAmount] = useState(null);
	const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
	const [tokenOne, setTokenOne] = useState(tokenList[0]);
	const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
	const [isOpen, setIsOpen] = useState(false);
	const [changeToken, setChangeToken] = useState(1);
    const [fromChain, setFromChain] = useState(0);
	const [toChain, setToChain] = useState(1);
	const [swapAmount, setSwapAmount] = useState(null);
	const [messageApi, contextHolder] = message.useMessage();

	const [modalOpen, setModalOpen] = useState(false);

	const {account} = props;
	const {chains, switchChain} = useSwitchChain();
	const {isError, isPending , isSuccess,isLoading, status, txHash, confirmationState, setConfirmationState, setTxHash, executeTx} = useTx('swap', chainList[toChain].chainID, 'DSC', swapAmount, account.address);
	const {balance, setBalance} = useBalance(chainList[fromChain].chainID, 'DSC', account.address);	

	function handleSlippageChange(e){
		setSlippage(e.target.value);
	}

	function changeAmount(e){
		setTokenOneAmount(e.target.value);
	}

	function switchChains(){
		const one = fromChain;
		const two = toChain;
		setFromChain(two);
		setToChain(one);
	}


	function modifyToken(i){
		if(changeToken == 1){
			setTokenOne(tokenList[i]);
		} else {
			setTokenTwo(tokenList[i]);
		}
		setIsOpen(false);
	}

	function changeFromChain(index){
		if(index == toChain){
			switchChains();
		}else{
			setFromChain(index);
		}
		setBalance(NaN);
	}

	function changeToChain(index){
		if(index == fromChain){
			switchChains();
		}else{
			setToChain(index);
		}
	}
	
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

	function changeSwapAmount(e){
		setSwapAmount(e.target.value);
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

    const fromChainDropdown = chainList.map((chain, index) => (
        {
            key: index.toString(),
            label: (
                <div className='dropdownChoice' onClick={() => changeFromChain(index)}>
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

	const toChainDropdown = chainList.map((chain, index) => (
        {
            key: index.toString(),
            label: (
                <div className='dropdownChoice' onClick={() => changeToChain(index)}>
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
	
	const setting = (
		<>
			<div>Slippage tolerance</div>
			<div>
				<Radio.Group value={slippage} onChange={handleSlippageChange}>
					<Radio.Button value={0.5}>0.5%</Radio.Button>
					<Radio.Button value={2.5}>2.5%</Radio.Button>
					<Radio.Button value={5}>5%</Radio.Button>
				</Radio.Group>
			</div>
		</>
	);

	const dalUSD = {
		"ticker": "DSC",
		"img": "https://cryptologos.cc/logos/versions/dogecoin-doge-logo-alternative.svg?v=032",
		"name": "Duc Anh Le USD",
		"address": "0xDFf5Ba9FCff83cE455e45De7572B6259b0E7D7dE",
		"decimals": 6
	};

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
			setSwapAmount(NaN);
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

  	return (
		<>
		{contextHolder}
		<div className='tradeBox'>
			<div className='tradeBoxHeader'>
				<h2>Swap</h2>
			</div>
			<div className='row'>
				<div className='selector'>
					<div style={{textAlign: 'left', color: 'gray',fontWeight: 'bold',marginBottom: '4px'}}>
						From
					</div>
					<Dropdown menu={{items: fromChainDropdown,}}>
						<div className='dropdownSwap' style={{ marginRight: '4px'}} >
								<div style={{display:'flex', gap: '10px'}}>
									<img src={chainList[fromChain].img} alt="assetOneLogo" className='assetLogo'></img>
									{chainList[fromChain].chainName}
								</div>
								<div>
									<CaretDownOutlined></CaretDownOutlined>
								</div>
						</div>
					</Dropdown>
				</div>
				<div className='selector'>
					<div style={{textAlign: 'left', color: 'gray',  fontWeight: 'bold', marginLeft:'4px', marginBottom: '4px'}}>
						To
					</div>
					<Dropdown menu={{items: toChainDropdown,}}>
						<div className='dropdownSwap' style={{marginLeft:'4px'}}>
								<div style={{display:'flex', gap: '10px'}}>
									<img src={chainList[toChain].img} alt="assetOneLogo" className='assetLogo'></img>
									{chainList[toChain].chainName}
								</div>
								<div>
									<CaretDownOutlined></CaretDownOutlined>
								</div>
						</div>
					</Dropdown>
				</div>
			</div>
			<div className='selector'>
					<div style={{textAlign: 'left', color: 'gray', fontWeight: 'bold',marginBottom: '4px', marginTop: '8px'}}>
						Amount
					</div>
					<div className='inputs'>
						<input onChange={(e) => changeSwapAmount(e)} value={swapAmount}  placeholder='0.0' type='number' onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)} style={{paddingRight: 100}} className='value-input-6'></input>
						<div className='assetOne' style={{fontSize: 14, fontWeight: 600}}>
							<img src={dalUSD.img} alt="assetOneLogo" className='assetLogo' style={{height: 24}}></img>
							{dalUSD.ticker}
						</div>
					</div>
				</div>

				<div style={{color: 'gray', marginTop: 10, width: '100%'}}>
					Max: {balance==balance && balance.toFixed(2)} {balance != balance && <LoadingAnimation/>}• <span style={{color: '#5981F3'}} onClick={() => setSwapAmount(balance)}> USE MAX</span>
				</div>

				{(chainList[fromChain].chainID != account.chainId) &&
                    <div style={{marginTop: '16px'}} className='swapButton' onClick={() => switchChain({chainId: chainList[fromChain].chainID})}>Switch to {chainList[fromChain].chainName}</div>
                }

                {(confirmationState != 'confirming' && chainList[fromChain].chainID == account.chainId) &&
                    <div style={{marginTop: '16px'}} className='swapButton' disabled={balance < swapAmount || !swapAmount || swapAmount == 0} onClick={() => executeTx()}>Swap</div>
                }

                {(confirmationState == 'confirming' && chainList[fromChain].chainID == account.chainId) &&
                    <div style={{marginTop: '16px'}} className='swapButton' disabled={true} ><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>
                }	
			</div>
		</>
  )
}


export default Swap;