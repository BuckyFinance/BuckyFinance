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

// function Swap() {
// 	const [slippage, setSlippage] = useState(2.5);
// 	const [tokenOneAmount, setTokenOneAmount] = useState(null);
// 	const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
// 	const [tokenOne, setTokenOne] = useState(tokenList[0]);
// 	const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [changeToken, setChangeToken] = useState(1)

// 	function handleSlippageChange(e){
// 		setSlippage(e.target.value);
// 	}

// 	function changeAmount(e){
// 		setTokenOneAmount(e.target.value);
// 	}

// 	function switchTokens(){
// 		const one = tokenOne;
// 		const two = tokenTwo;
// 		setTokenOne(two);
// 		setTokenTwo(one);
// 	}

// 	function openModal(asset){
// 		setChangeToken(asset);
// 		setIsOpen(true);
// 	}

// 	function modifyToken(i){
// 		if(changeToken == 1){
// 			setTokenOne(tokenList[i]);
// 		} else {
// 			setTokenTwo(tokenList[i]);
// 		}
// 		setIsOpen(false);
// 	}

// 	const setting = (
// 		<>
// 			<div>Slippage tolerance</div>
// 			<div>
// 				<Radio.Group value={slippage} onChange={handleSlippageChange}>
// 					<Radio.Button value={0.5}>0.5%</Radio.Button>
// 					<Radio.Button value={2.5}>2.5%</Radio.Button>
// 					<Radio.Button value={5}>5%</Radio.Button>
// 				</Radio.Group>
// 			</div>
// 		</>
// 	);

//   	return (
// 		<>
// 		<Modal
// 			open={isOpen}
// 			footer={null}
// 			onCancel={() => setIsOpen(false)}
// 			title="Select a token"
// 		>
// 			<div className='modalContent'>
// 				{tokenList?.map((e,i) => {
// 					return(
// 						<div
// 							className='tokenChoice'
// 							key={i}
// 							onClick={() => modifyToken(i)}
// 						>
// 							<img src={e.img} alt={e.ticker} className='tokenLogo'></img>
// 							<div className='tokenChoiceNames'>
// 								<div className='tokenName'>{e.name}</div>
// 								<div className='tokenTicker'>{e.ticker}</div>
// 							</div>
// 						</div>
// 					)
// 				})}
// 			</div>
// 		</Modal>

// 		<div className='tradeBox'>
// 			<div className='tradeBoxHeader'>
// 				<h4>Swap</h4>
// 				<Popover
// 					content={setting}
// 					title="Settings"
// 					trigger="click"
// 					placement='bottomRight'
// 				>
// 					<SettingOutlined className='cog'></SettingOutlined>
// 				</Popover>
// 			</div>
// 			<div className="inputs">
// 				<Input placeholder="0" value={tokenOneAmount} onChange={changeAmount}></Input>
// 				<Input placeholder="0" value={tokenTwoAmount} disabled={true}></Input>

// 				<div className="switchButton" onClick={switchTokens}>
// 					<SmileOutlined className="switchArrows"></SmileOutlined>
// 				</div>

// 				<div className='assetOne' onClick={() => openModal(1)}>
// 					<img src={tokenOne.img} alt="assetOneLogo" className='assetLogo'></img>
// 					{tokenOne.ticker}
// 					<DownOutlined></DownOutlined>
// 				</div>

// 				<div className='assetTwo' onClick={() => openModal(2)}>
// 					<img src={tokenTwo.img} alt="assetTwoLogo" className='assetLogo'></img>
// 					{tokenTwo.ticker}
// 					<DownOutlined></DownOutlined>
// 				</div>
// 			</div>
// 			<div className='swapButton' disabled={!tokenOneAmount}>Swap</div>
// 		</div>
// 		</>
//   )
// }

// const depositButtonTheme = Object.freeze({
// 	components: {
// 		Button: {
// 			defaultActiveBg: "#243056",
// 		}
// 	}
// });

const SplitScreen = (props) => {
	const DEPOSIT_STATE = 1;
	const WITHDRAW_STATE = 2;
	const NO_STATE = 0;
	const MINT_STATE = 1
	const BURN_STATE = 2
	const {account, config} = props;
	const e = {
		
		"ticker": "USDC",
		"img": "https://cdn.moralis.io/eth/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
		"name": "USD Coin",
		"address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
		"decimals": 6
	
	}

	const [tokenList, setTokenList] = useState(chainList[0].tokens);
	const [healthFactor, setHealthFactor] = useState(0);
	const [totalCollateral, setTotalCollateral] = useState(Math.random() * 1000000);
	const [totalMinted, setTotalMinted] = useState(Math.random() * 100000);
	const [chainSpecificMinted, setChainSpecificMinted] = useState(Math.random() * 100000);
	const [creditScore, setCreditScore] = useState(686);
	const [buttonStates, setButtonStates] =  useState(
		tokenList.map(() => NO_STATE)
	);
	const [mintState, setMintState] = useState(NO_STATE);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalTitle, setModalTitle] = useState('Title');
	const [modalAction, setModalAction] = useState('Hallo');
	const [modalToken, setModalToken] = useState(e);
	const [mintAmount, setMintAmount] = useState(null);
	const [modalAmount, setModalAmount] = useState();
	const [burnAmount, setBurnAmount] = useState(null);
	const [tokenDepositAmounts, setTokenDepositAmounts] =  useState(
		tokenList.map(() => null)
	);
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
	});
	const [currentMintChain, setCurrentMintChain] = useState(() => {
		var index = 0;
		for(const chain of chainList){
			if(chain.chainID == account.chainId){
				return index;
			}
			index += 1;
		}
	});
	const [currentModalChain, setCurrentModalChain] = useState(0);
	  

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
		setCurrentCollateralChain(id);
		setTokenList(chainList[currentCollateralChain].tokens);
		setTokenDepositAmounts(tokenList.map(() => null));
		setButtonStates(tokenList.map(() => NO_STATE));
		// console.log(tokenList);
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
		
	const dalUSD = {
		"ticker": "dalUSD",
		"img": "https://cdn.moralis.io/eth/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
		"name": "Duc Anh Le USD",
		"address": "0xDFf5Ba9FCff83cE455e45De7572B6259b0E7D7dE",
		"decimals": 6
	};


	const handleMintButton = (newState) =>{
		setMintAmount(null);
		setMintState(newState);
	};

	const openModal = (title, action, chain, token, amount) => {
		setModalTitle(title);
		setModalAction(action);
		setCurrentModalChain(chain);
		setModalToken(token);
		setModalAmount(amount);
		setModalOpen(true);
	};

	

	function changeMintAmount(e){
		setMintAmount(e.target.value);
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

	if(account.isConnected)
		return (
			<>
				<Modal
					open={modalOpen}
					footer={null}
					onCancel={() => setModalOpen(false)}
					title={modalTitle}
				>
					<div className='modalContent'>
						{/* <div>
							You are about to {modalAction}
						</div> */}

						<div className='rowRowRowRow'>
							{/* <div style={{fontSize: 'xx-large'}}>
								{modalAction}: 
							</div> */}
							<div  style={{fontSize: '4em', marginRight: '.3em', fontFamily: 'Kanit'}}>
								{modalAmount}
							</div>
							<div className='tokenChoice'>
								<img src={modalToken.img} alt={modalToken.ticker} className='tokenLogo'></img>
								<div className='tokenChoiceNames'>
									<div className='tokenName'>{modalToken.name}</div>
									<div className='tokenTicker'>{modalToken.ticker}</div>
								</div>
							</div>
						</div>
						<div style={{color: 'gray'}}>
							Fee: 1.23 ETH
						</div>
						{account.chainId == chainList[currentModalChain].chainID &&
							<ColorButton variant="contained" className='depositButton' style={{width: '8em', marginTop: '12px'}}>{modalAction}</ColorButton>
						}

						{account.chainId != chainList[currentModalChain].chainID &&
							<ColorButton variant="contained" onClick={() => switchChain({ chainId: chainList[currentModalChain].chainID })} className='depositButton' style={{ marginTop: '12px'}}>Switch to {chainList[currentModalChain].chainName}</ColorButton>
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
											<TableCell style={{color: 'white', fontWeight: 'bold', background: '#0E111B'}}>Asset</TableCell>
											<TableCell style={{color: 'white', fontWeight: 'bold', background: '#0E111B'}} align="right">Deposited</TableCell>
											<TableCell style={{color: 'white', fontWeight: 'bold', background: '#0E111B'}} align="right">In wallet</TableCell>
											<TableCell style={{color: 'white', fontWeight: 'bold', background: '#0E111B'}} align="right">
												<div>
													Total Collateral
													<div style={{fontFamily: 'Kanit'}}>
													{(Math.random() * 100000).toFixed(2)}$
													</div>
												</div>
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody style={{overflowY: 'scroll',height: '100%'}}>

										{tokenList?.map((e,i) => {
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
													<TableCell style={{fontFamily: 'Kanit', color: 'white', fontWeight: 'bold'}} align="right">{(Math.random() * 100000).toFixed(5)} </TableCell>
													<TableCell style={{fontFamily: 'Kanit', color: 'white', fontWeight: 'bold'}} align="right">{(Math.random() * 100000).toFixed(5)} </TableCell>
													<TableCell style={{color: 'white', fontWeight: 'bold'}} align="right">
														{buttonStates[i] == NO_STATE && 
															<div>
																<ColorButton variant="contained" className='depositButton' style={{width: '8em'}} onClick={() => handleButtonClick(i, DEPOSIT_STATE)}>Deposit</ColorButton>
																<ColorButton variant="contained" disabled style={{marginLeft: '.5em', width: '8em'}} onClick={() => handleButtonClick(i, WITHDRAW_STATE)}>
																	Withdraw
																</ColorButton>
															</div>
														}

														{buttonStates[i] == DEPOSIT_STATE && 
															<div>
																<CloseCircleFilled  onClick={() => handleButtonClick(i, NO_STATE)} className='aButton'/>
																<input className='value-input' type="number" onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)}  placeholder='0' value={tokenDepositAmounts[i]} onChange={(e) => changeDepositAmount(e, i)}></input>

																<ColorButton variant="contained" style={{marginLeft: '.5em', width: '8em'}} onClick={() => openModal("Depositing confirmation", "deposit", currentCollateralChain, e, tokenDepositAmounts[i])} disabled={!tokenDepositAmounts[i] || tokenDepositAmounts[i] == 0}> 
																	Deposit
																</ColorButton>
															</div>
														}

														{buttonStates[i] == WITHDRAW_STATE && 
															<div>
																<input className='value-input' placeholder='0' value={tokenDepositAmounts[i]}></input>

																<ColorButton variant="contained" style={{marginLeft: '.5em', width: '8em'}} onClick={() => openModal("Withdrawal confirmation", "withdraw", currentCollateralChain, e, tokenDepositAmounts[i])} disabled={!tokenDepositAmounts[i] || tokenDepositAmounts[i] == 0}>
																	Withdraw
																</ColorButton>
															</div>
														}
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
										Mint
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
												<div>
													Total minted on {chainList[currentMintChain].chainName}
												</div>
											}

											{mintState == MINT_STATE &&
												<div>
													Mint on {chainList[currentMintChain].chainName}
												</div>
											}

											{mintState == BURN_STATE &&
												<div>
													Burn on {chainList[currentMintChain].chainName}
												</div>
											}
										</div>
										{(mintState == NO_STATE) &&
											<div style={{fontSize: '64px', fontFamily: "Kanit"}}>
												{chainSpecificMinted.toFixed(2)}
											</div>
										}

										{(mintState == BURN_STATE || mintState == MINT_STATE) &&
											<input className='value-input-2' placeholder='0' type='number' value={mintAmount} onKeyDown={(e) => FilterInput(e)} onPaste={(e) => handlePaste(e)} onChange={changeMintAmount}></input>
											
										}
										<div>
											dalUSD
										</div>
										<div className='rowRow'>
											{mintState == NO_STATE &&
												<>
													<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => handleMintButton(MINT_STATE)}>Mint</ColorButton>
													<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => handleMintButton(BURN_STATE)}>Burn</ColorButton>
												</>
											}

											{mintState == MINT_STATE &&
												<>
													<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => openModal("Minting confirmation", "mint", currentMintChain, dalUSD, mintAmount)} disabled={!mintAmount || mintAmount == 0}>Mint</ColorButton>
													<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => handleMintButton(NO_STATE)}>Cancel</ColorButton>
												</>
											}

											{mintState == BURN_STATE &&
												<>
													<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => handleMintButton(NO_STATE)} >cancel</ColorButton>
													<ColorButton  variant="contained"  style={{width: '30%', margin: '.5em', marginTop: '1em'}} onClick={() => openModal("Burning confirmation", "burn", currentMintChain, dalUSD, mintAmount)} disabled={!mintAmount || mintAmount == 0}>Burn</ColorButton>
												</>
											}

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
										Credit Score: Medium
									</div>
								</div>
								
								<div className='boxBox'>
									<div style={{height:'100%', width: `90%`}} >
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
												({ value, valueMax }) => `${value} / ${valueMax}`
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
										<div className='dataBoxHeader'>
											Health Factor
										</div>
										<div className='dataNumber'>
											{(totalCollateral / totalMinted).toFixed(2)}
										</div>
									</div>
								</div>
								<div className='subBox2'>
									<div className='dataBoxContainer'>
										<div className='dataNumber'>
											=
										</div>
									</div>
								</div>
								<div className='subBox'>
									<div className='dataBoxContainer' style={{borderBottom: '3px solid white'}}>
										<div className='dataBoxHeader'>
											Total Collateral
										</div>
										<div className='dataNumber'>
											{totalCollateral.toFixed(2)}$
										</div>
									</div>
									<div className='dataBoxContainer'>
										<div className='dataBoxHeader'>
											Total Minted
										</div>
										<div className='dataNumber'>
											{totalMinted.toFixed(2)}$
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Flex>
			</>
		);
		
		else return(
			<>
				<div className='box' style={{width: '50%', height: '60vh', display: 'flex', flexDirection: 'column', 'alignItems': 'center', justifyContent: 'center'}}>
					<div style={{fontSize: '3em'}}>
						Please connect your wallet!
					</div>
					<div style={{fontSize: '5em'}}>
					<DisconnectOutlined /></div>

				</div>
			</>
		)
};
	
export default SplitScreen;
// export default Swap