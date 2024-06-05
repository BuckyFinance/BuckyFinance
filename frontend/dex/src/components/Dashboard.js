import React, {useState, useEffect} from 'react'
import {Input, Popover, Radio, Modal, message} from "antd"
import {
	ArrowDownOutLined,
	DownOutlined,
	SmileOutlined,
	SettingOutlined,
	PlusOutlined,
	CaretDownOutlined,
	CloseCircleFilled,
	ConsoleSqlOutlined,
	CalculatorOutlined,
	DisconnectOutlined
} from "@ant-design/icons"
import { Row, Col, Flex, Space, Dropdown } from 'antd';

import chainList from "../tokenList.json"
import Eth from "../eth.svg"

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { TextField } from '@mui/material';
import { useSwitchChain } from 'wagmi'
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useDeposited } from '../hooks/useDeposited';
import { useMinted } from '../hooks/useMinted';
import { useTotalCollateralValue, useTotalMintedValue } from '../hooks/useOverall';
import {ethers} from 'ethers';
import {mint} from "../backend/scripts/mint.js"
import {deposit} from "../backend/scripts/deposit.js"
import {useTx} from "../hooks/useWriteTx.js"
import LoadingAnimation from "../loading.js"
import { calc } from 'antd/es/theme/internal.js';

const Dashboard = ({account, config, creditScore, creditStatus, setCreditStatus, calculateCredit}) => {
	const DEPOSIT_STATE = 1;
	const WITHDRAW_STATE = 2;
	const NO_STATE = 0;
	const MINT_STATE = 1
	const BURN_STATE = 2



	const dalUSD = {
		"ticker": "DSC",
		"img": "https://cryptologos.cc/logos/versions/dogecoin-doge-logo-alternative.svg?v=032",
		"name": "Duc Anh Le USD",
		"address": "0xDFf5Ba9FCff83cE455e45De7572B6259b0E7D7dE",
		"decimals": 6
	};

	const [tokenList, setTokenList] = useState(chainList[0].tokens);
	const [healthFactor, setHealthFactor] = useState(0);
	const [totalCollateral, setTotalCollateral] = useState(Math.random() * 1000000);
	const [totalMinted, setTotalMinted] = useState(Math.random() * 100000);
	const [chainSpecificMinted, setChainSpecificMinted] = useState(Math.random() * 100000);
	
	const [buttonStates, setButtonStates] =  useState(
		tokenList.map(() => NO_STATE)
	);
	const [mintState, setMintState] = useState(NO_STATE);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalTitle, setModalTitle] = useState('Title');
	const [modalAction, setModalAction] = useState('Hallo');
	const [modalToken, setModalToken] = useState(dalUSD);
	const [modalTargetChain, setModalTargetChain] = useState(0);
	const [mintAmount, setMintAmount] = useState(null);
	const [modalAmount, setModalAmount] = useState(null);
	const [burnAmount, setBurnAmount] = useState(null);
	const [tokenDepositAmounts, setTokenDepositAmounts] =  useState(
		tokenList.map(() => null)
	);
	const [messageApi, contextHolder] = message.useMessage();
	const [tokenWithdrawAmounts, setTokenWithdrawAmounts] =  useState(
		tokenList.map(() => null)
	);
	const [currentCollateralChain, setCurrentCollateralChain] = useState(() => {
		var index = 0;
		for(const chain of chainList){
			if(chain.chainID == account.chainId){
				return index;
			}
			index += 1;
		}
		return 0;
	});
	
	const {tokenDeposited, totalCollateralValueOnChain, setTokenDeposited, setTotalCollateralValueOnChain} = useDeposited(tokenList, account.address,chainList[currentCollateralChain].chainID );
	const [currentMintChain, setCurrentMintChain] = useState(() => {
		var index = 0;
		for(const chain of chainList){
			if(chain.chainID == account.chainId){
				return index;
			}
			index += 1;
		}
		return 0;
	});
	const {tokenMinted, canMint} = useMinted( account.address, chainList[currentMintChain].chainID);
	const [currentModalChain, setCurrentModalChain] = useState(0);
	const {totalCollateralValue} = useTotalCollateralValue(account.address);
	const {totalMintedValue} = useTotalMintedValue(account.address);
	
	
	const {isError, isPending , isSuccess,isLoading, status, txHash, confirmationState, setConfirmationState, setTxHash, executeTx} = useTx(modalAction, chainList[currentModalChain].chainID, modalToken.ticker, modalAmount, account.address);
		
	const [modalMaxAmount, setModalMaxAmount] = useState(0);

	const chainDropdown = chainList.map((chain, index) => (
	{
		key: index.toString(),
		label: (
			<div className='dropdownChoice' onClick={() => changeCollateralChain(index)}>
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

	const [stat, setStat] = useState('Health Factor');

	const chainMintDropdown = chainList.map((chain, index) => (
		{
			key: index.toString(),
			label: (
				<div className='dropdownChoice' onClick={() => changeMintChain(index)}>
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
	const { chains, switchChain } = useSwitchChain()
	function changeMintChain(index){
		setCurrentMintChain(index);
	}
		
	function changeCollateralChain(id){
		// console.log(id);
		const updated = tokenDeposited.map(token => ({
			...token,
			deposited: null,
			inWallet: null
		}));
		console.log("Set ", id);
		setCurrentCollateralChain(id);
		setTokenList(chainList[currentCollateralChain].tokens);
		setTokenDepositAmounts(tokenList.map(() => null));
		setButtonStates(tokenList.map(() => NO_STATE));
		setTokenDeposited(updated);
		setTotalCollateralValueOnChain(NaN);
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

	const handleButtonClick = (index, newState) => {
		setButtonStates((prevStates) => 
			prevStates.map((state, idx) => 
				idx === index ? newState : state
			)
		);
	};
		
	


	const handleMintButton = (newState) =>{
		setMintAmount(null);
		setMintState(newState);
	};

	const openModal =  (title, action, chain, targetChain, token) => {
		setModalAmount(null);
		setModalTitle(title);
		setModalAction(action);
		setCurrentModalChain(chain);
		setModalTargetChain(targetChain);
		setModalToken(token);
		fetchMaxModalAmount(action, token);
		setModalOpen(true);
		const t = document.getElementsByClassName('value-input-5')[0];
		if(t){
			t.value = null;
		}
	};



	

	function changeMintAmount(e){
		setMintAmount(e.target.value);
	}


	function changeModalAmount(e){
		setModalAmount(e.target.value);
	}

	function changeDepositAmount(e, i){
		setTokenDepositAmounts((prevStates) => 
			prevStates.map((state, idx) => 
				idx === i ? e.target.value : state
			)
		)	;
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

	function _executeTx(){
		executeTx();
	}

	const tokenIndex = {
		"WBTC": 0,
		"WETH": 1,
		"LINK": 2,
		"AVAX": 3,
		"UNI": 4,
		"USDC": 5,
		"USDT": 6,
	}

	async function fetchMaxModalAmount(action, token){
		if(action == 'Borrow'){
			setModalMaxAmount(canMint);
		}else if(action == 'Repay'){
			setModalMaxAmount(tokenMinted);
		}else if(action == 'Deposit'){
			setModalMaxAmount(parseFloat(tokenDeposited[tokenIndex[token.ticker]].inWallet));
		}else if(action == 'Withdraw'){
			setModalMaxAmount(parseFloat(tokenDeposited[tokenIndex[token.ticker]].deposited));
		}
	}

	function toggleWidths() {
		var boxes = document.querySelectorAll('.subBox');
		boxes.forEach(function(box) {
			box.classList.toggle('expanded');
		});
	}

	useEffect(() => {
		if(creditStatus == 'calculating'){
			messageApi.destroy();
			messageApi.open({
				type: 'loading',
				content: 'Calculating...',
				duration: 0,
			});
		}else if(creditStatus == 'calculated'){
			messageApi.destroy();
			messageApi.open({
				type: 'success',
				content: 'Calculated successfully!',
				duration: 1.5,
			});
			setCreditStatus('none');
		}
	}, [creditStatus]);

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
			setModalOpen(false);
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

	// useEffect(() => {
	// 	messageApi.destroy();
	// 	if(isSuccess){
	// 		messageApi.open({
	// 			type: 'success',
	// 			content: 'Transaction Successful!',
	// 			duration: 1.5,
	// 		})
	// 	}
	// }, [isSuccess]);
	// messageApi.open({
	// 			type: 'success',
	// 			content: 'Transaction Successful!',
	// 			duration: 0,
	// 		});

        // Function to modify the dy attributes of the tspan elements
      
		const getConditionalText = ({ value, valueMax }) => {
			return value < 300 ? 'Not available' : `${value} / ${valueMax}`;
		  };



	return (
		<>
			{contextHolder}
			<Modal
				open={modalOpen}
				footer={null}
				onCancel={() => setModalOpen(false)}
				title={modalTitle}
				width={400}
			>
				<div className='modalContent'>
					<div className='rowRowRowRow' style={{fontSize: 20, gap: 5, fontWeight: 'bold'}}>
						<img src={chainList[currentModalChain].img} alt="assetOneLogo" className='assetLogo' style={{height: 28}}></img>
						{chainList[currentModalChain].chainName}
					</div>
					{/* <div>
						You are about to {modalAction}
					</div> */}
					<div className='selector'>
						<div style={{textAlign: 'left', color: 'gray', fontWeight: 'bold',marginBottom: '4px', marginTop: '8px'}}>
							Amount 
						</div>
						<div className='inputs'>
							<input value={modalAmount} placeholder='0.0' onChange={(e) => changeModalAmount(e)}type='number' onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)} style={{paddingRight: 100}} className='value-input-5'></input>
							<div className='assetOne' style={{fontSize: 14, fontWeight: 600}}>
								<img src={modalToken.img} alt="assetOneLogo" className='assetLogo' style={{height: 24}}></img>
								{modalToken.ticker}
							</div>
						</div>
					</div>
					
					<div style={{color: 'gray', marginTop: 10}}>
						Max: {modalMaxAmount.toFixed(2)} • <span style={{color: '#5981F3'}} onClick={() => setModalAmount(modalMaxAmount)}> USE MAX</span>
					</div>

					{/* <div style={{marginTop: '16px'}} className='swapButton' onClick={() => switchChain({chainId: depositChain.chainID})}>Switch to {depositChain.chainName}</div> */}

					{(confirmationState != 'confirming' && account.chainId == chainList[modalTargetChain].chainID) &&

						<div className="swapButton2" disabled={modalAmount == 0 || !modalAmount || modalAmount > modalMaxAmount} variant="contained"  style={{width: '8em', marginTop: '10px'}} onClick={() => _executeTx()}>{modalAction}</div>
					}

					{(confirmationState == 'confirming' && account.chainId == chainList[modalTargetChain].chainID) &&

						<div className="swapButton2" disabled variant="contained"  style={{width: '8em', marginTop: '10px'}} ><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>
					}


					{account.chainId != chainList[modalTargetChain].chainID &&
						<div className="swapButton2" variant="contained" onClick={() => switchChain({ chainId: chainList[modalTargetChain].chainID })} style={{ marginTop: '10px'}}>Switch to {chainList[modalTargetChain].chainName}</div>
					}
				</div>
			</Modal>
			<Flex>
				<div className='container' id='style-1'>
					<div class='box'>
						<div className='containerHeader'>
							<div>
								Collateral
							</div>
							<Dropdown menu={{items: chainDropdown,}}>
								<div className='dropdown' >
										<img src={chainList[currentCollateralChain].img} alt="assetOneLogo" className='assetLogo'></img>
										{chainList[currentCollateralChain].chainName}
										<CaretDownOutlined></CaretDownOutlined>
								</div>
							</Dropdown>
						</div>
						<TableContainer component={Paper} style={{background: '#0E111B'}} className='assetTable'>
							<Table  aria-label="simple table" stickyHeader  >
								<TableHead>
									<TableRow>
										<TableCell style={{fontSize: 16, color: 'white', fontWeight: 'bold', background: '#0E111B'}}>Asset</TableCell>
										<TableCell style={{fontSize: 16, color: 'white', fontWeight: 'bold', background: '#0E111B'}} align="right">Deposited</TableCell>
										<TableCell style={{fontSize: 16, color: 'white', fontWeight: 'bold', background: '#0E111B'}} align="right">In wallet</TableCell>
										<TableCell style={{fontSize: 16, color: 'white', fontWeight: 'bold', background: '#0E111B'}} align="right">
											<div>
												Total Collateral
												<div style={{fontFamily: 'Kanit'}}>
												{totalCollateralValueOnChain != totalCollateralValueOnChain &&
													<LoadingAnimation style={{fontSize: 12}}/>
													
												}

												{totalCollateralValueOnChain == totalCollateralValueOnChain &&
													<>
													{totalCollateralValueOnChain.toFixed(2)}$
													</>
												}	
												</div>
											</div>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody style={{overflowY: 'scroll',height: '100%'}}>

									{tokenDeposited?.map((e,i) => {
										return(
											<TableRow>
												<TableCell component="th" scope="row" style={{color: 'white', fontWeight: 'bold'}} >
													<div className='tokenChoice'>
												<img src={e.img} alt={e.ticker} className='tokenLogo'></img>
														<div className='tokenChoiceNames'>
															<div className='tokenName'>{e.name}</div>
															<div className='tokenTicker'>{e.ticker}</div>
														</div>
													</div>
												</TableCell>
												<TableCell style={{fontFamily: 'Kanit', color: 'white', fontWeight: 'bold', fontSize: 24}} align="right">
													{e.deposited}
													{!e.deposited && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
												</TableCell>
												<TableCell style={{fontFamily: 'Kanit', color: 'white', fontWeight: 'bold', fontSize: 24}} align="right">
													{e.inWallet}
													{!e.inWallet && <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />}
												</TableCell>
												<TableCell style={{color: 'white', fontWeight: 'bold'}} align="right">
													<div>
														<ColorButton variant="contained" className='depositButton' style={{width: '8em'}} onClick={() => openModal("Deposit", "Deposit", currentCollateralChain, currentCollateralChain, e)} disabled={tokenDeposited[i].inWallet == 0 || !tokenDeposited[i].inWallet}>Deposit</ColorButton>
														<ColorButton variant="contained" disabled={e.deposited == 0 || !e.deposited} style={{marginLeft: '.5em', width: '8em'}} onClick={() => openModal("Withdraw", "Withdraw", currentCollateralChain, 2, e)} disable={tokenDeposited[i].deposited == 0}>
															Withdraw
														</ColorButton>
													</div>
												</TableCell>
											</TableRow>
										)
									})};
								</TableBody>
							</Table>
						</TableContainer>
					</div>
				</div>
				<div className='container'>
					<div className='rowContainer'>
						<div class='box2' style={{marginBottom: '1em', marginRight: '1em'}}>
							<div className='containerHeader'>
								<div>
									Borrow
								</div>
								<Dropdown menu={{items: chainMintDropdown,}}>
									<div className='dropdown' >
											<img src={chainList[currentMintChain].img} alt="assetOneLogo" className='assetLogo'></img>
											{chainList[currentMintChain].chainName}
											<CaretDownOutlined></CaretDownOutlined>
									</div>
								</Dropdown>
							</div>
							<div className='subBoxContainer'>
								<div className='subBoxLeft'>
									<div style={{textAlign: 'center', fontWeight:'bold'}}>
										{mintState == NO_STATE &&
											<div style={{fontSize: 20}}>
												Total borrowed DSC on {chainList[currentMintChain].chainName}
											</div>
										}

									</div>
									{(mintState == NO_STATE) &&
										<div style={{fontSize: '64px', fontFamily: "Kanit", gap: 8}} className='rowRowRowRow'>
											{tokenMinted.toFixed(2)}
											<div style={{display: 'flex', flexDirection: 'column'}}>
												<img src={dalUSD.img} alt="assetOneLogo" className='assetLogo' style={{height: 44}}></img>
											</div>
										</div>
									}

									{(mintState == BURN_STATE || mintState == MINT_STATE) &&
										<input className='value-input-2' placeholder='0' type='number' value={mintAmount} onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)} onChange={changeMintAmount}></input>
										
									}
						
									<div className='rowRow'>
											<>
												<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => openModal("Borrow", "Borrow", currentMintChain, 2, dalUSD)}>Borrow</ColorButton>
												<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => openModal("Repay", "Repay", currentMintChain, currentMintChain, dalUSD, mintAmount)}>Repay</ColorButton>
											</>
										

									</div>
								</div>

								{/* <div className='subBoxRight'>
									<div className='inputs' style={{padding: '1em'}}>
										<Input placeholder="0"></Input>
									</div>
									<div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyItems: 'center', alignItems: 'center', alignContent: 'center'}}>
										<ColorButton variant="contained" className='depositButton' style={{width: '30%', margin: '.3em'}}>Mint</ColorButton>
										<ColorButton variant="contained" className='depositButton' style={{width: '30%', margin: '.3em'}}>Burn</ColorButton>
									</div>
								</div> */}
							</div>
						</div>

						<div class='box2' style={{marginBottom: '1em'}}>
							<div className='containerHeader'>
									<div>
									Credit Score 
									</div>
									<div className='dropdown' style={{paddingLeft: 6, paddingBottom: 1}} onClick={() => {
										if(account.chainId != 43113){
											switchChain({chainId: 43113});
										}else
										calculateCredit();
									}
									}>
										<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Circle-icons-calculator.svg/512px-Circle-icons-calculator.svg.png" height={24}></img>
										Calculate
									</div>
							</div>
							
							<div className='boxBox' style={{position: 'relative'}}>
								<div style={{height:'100%', width: `90%`}} >
								{/* <span style={{position: 'absolute', top: '100px', left: '180px'}}>100%</span> */}
									<Gauge
										cornerRadius="50%"
										className='boxBoxBox'
										value={creditScore}
										startAngle={-110}
										endAngle={110}
										valueMin={300}
										valueMax={1000}
										labelTextColor='white'
										sx={{
											[`& .${gaugeClasses.valueText}`]: {
												fontSize: 40,
												transform: 'translate(0px, 0px)',
												fontFamily: 'Kanit'
											},
											[`& .${gaugeClasses.valueArc}`]: {
												fill: '#5981F3',
											},
											[`& .${gaugeClasses.referenceArc}`]: {
												fill: '#243056'
											},
										}}
										text={
											({ value, valueMax }) => getConditionalText({ value, valueMax })
										}
									/>
								</div>
							</div>
						</div>
					</div>

					<div class='box2' style={{marginTop: '1em'}}>
						{/* <div className='containerHeader'>
								<div>
									Status
								</div>
						</div> */}

						<div className='subBoxContainer'>
							<div className='subBox'>
								<div className='dataBoxContainer'>
									{stat == "Health Factor" &&
									<div className='dataBoxHeader'>
										Health Factor 
									</div>	
									}
									{stat != "Health Factor" &&
									<div className='dataBoxHeader' style={{color: '#404040'}} onClick={() => {toggleWidths();setStat("Health Factor")}}>
										Health Factor 
									</div>	
									}	
									
									{stat == "Health Factor" &&
									<div className='dataNumber'>
										{(totalCollateralValue * 0.8 / totalMintedValue).toFixed(2)}
									</div>
									}

									{stat != "Health Factor" &&
									<div className='dataNumber'>
										{(totalMintedValue / totalCollateralValue).toFixed(2)}
									</div>
									}
{/* 
									{stat == "LTV" &&
									<div className='dataBoxHeader'>
										Loan-to-value
									</div>
									}

									{stat != "LTV" &&
									<div className='dataBoxHeader' style={{color: '#404040'}} onClick={() => {toggleWidths();setStat('LTV')}}>
										Loan-to-value
									</div>
									} */}
								</div>
							</div>
							<div className='subBox2'>
								<div className='dataBoxContainer'>
									<div className='dataNumber' style={{fontSize: 80}}>
										=
									</div>
								</div>
							</div>
							{stat == "Health Factor" &&
							<div className='subBox'>
								<div className='dataBoxContainer' style={{borderBottom: '3px solid white'}}>
									<div className='dataBoxHeader'>
										Total Collateral
									</div>
									<div className='dataNumber'>
										{totalCollateralValue.toFixed(2)}$ ⨯ 80%
									</div>
								</div>
								<div className='dataBoxContainer'>
									<div className='dataBoxHeader'>
										Total Borrowed
									</div>
									<div className='dataNumber'>
										{totalMintedValue.toFixed(2)}$
									</div>
								</div>
							</div>
							}

							{stat == "LTV" &&
							<div className='subBox'>
								<div className='dataBoxContainer' style={{borderBottom: '3px solid white'}}>
									<div className='dataBoxHeader'>
										Total Borrowed
									</div>
									<div className='dataNumber'>
										{totalMintedValue.toFixed(2)}$
									</div>
								</div>
								<div className='dataBoxContainer'>
									<div className='dataBoxHeader'>
										Total Collateral
									</div>
									<div className='dataNumber'>
										{totalCollateralValue.toFixed(2)}$
									</div>
								</div>
							</div>
							}
						</div>
					</div>
				</div>
			</Flex>
			
		</>
	);
		
};
	
export default Dashboard;
// export default Swap