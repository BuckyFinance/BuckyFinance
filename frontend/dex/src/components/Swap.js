import React, {useState, useEffect} from 'react'
import {Input, Popover, Radio, Modal, message} from "antd"
import {
	ArrowDownOutLined,
	DownOutlined,
	SmileOutlined,
	SettingOutlined,
	PlusOutlined,
	CaretDownOutlined,
	ArrowRightOutlined
} from "@ant-design/icons"
import { Row, Col, Flex, Space, Dropdown } from 'antd';

import chainList from "../tokenList.json"
import "./Swap.css"
import { textAlign } from '@mui/system';
import { useSwitchChain } from 'wagmi'
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

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
	

	const [modalOpen, setModalOpen] = useState(false);

	const {account} = props;
	const {chains, switchChain} = useSwitchChain();

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

  	return (
		<>
		<Modal
			open={modalOpen}
			footer={null}
			onCancel={() => setModalOpen(false)}
			title="Swap confirmation"
		>
			<div className='modalContent'>
				<div className='rowRowRowRow' style={{gap: '10px', fontSize: 'x-large', fontWeight: 'bold', justifyContent: 'space-between', flexDirection: 'column'}}>
					<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
						<img src={chainList[fromChain].img} alt="assetOneLogo" className='assetLogo' style={{height: '36px'}}></img>
						{chainList[fromChain].chainName}
					</div>
					<div  style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
						<img src={chainList[toChain].img} alt="assetOneLogo" className='assetLogo' style={{height: '36px'}}></img>
						{chainList[toChain].chainName}
					</div>
				</div>

				{account.chainId == chainList[fromChain].chainID &&
					<ColorButton variant="contained" className='depositButton' style={{width: '8em', marginTop: '12px'}}>swap</ColorButton>
				}

				{account.chainId != chainList[fromChain].chainID &&
					<ColorButton variant="contained" onClick={() => switchChain({ chainId: chainList[fromChain].chainID })} className='depositButton' style={{ marginTop: '12px'}}>Switch to {chainList[fromChain].chainName}</ColorButton>
				}
			</div>
		</Modal>

		<div className='tradeBox'>
			<div className='tradeBoxHeader'>
				<h4>Swap</h4>
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
					<input onChange={(e) => changeSwapAmount(e)} value={swapAmount} type='number' onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)}  className='value-input-4'></input>
				</div>
			<div style={{marginTop: '16px'}} className='swapButton' disabled={!swapAmount} onClick={() => setModalOpen(true)}>Swap</div>
		</div>
		</>
  )
}


export default Swap;