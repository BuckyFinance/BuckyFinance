import "./App.css";
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"
import Swap from "./components/Swap"
import Tokens from "./components/Tokens"
import {Routes, Route} from 'react-router-dom'
import {useConnect, useAccount} from "wagmi"
import { ConnectButton } from '@rainbow-me/rainbowkit';
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
import { useCredit } from './hooks/useCredit.js';

// import {MetaMaskConnector} from "wagmi/connectors/metaMask"
// import '@rainbow-me/rainbowkit/styles.css';

// import {
//   getDefaultConfig,
//   RainbowKitProvider,
// } from '@rainbow-me/rainbowkit';
// import { WagmiProvider } from 'wagmi';
// import {
//   mainnet,
//   polygon,
//   optimism,
//   arbitrum,
//   base,
// } from 'wagmi/chains';
// import {
//   QueryClientProvider,
//   QueryClient,
// } from "@tanstack/react-query";

// import "@rainbow-me/rainbowkit/styles.css"
// import "../styles/global.css"

import { ThemeProvider, createTheme } from "@mui/material/styles";
import QuickBorrow from "./components/QuickBorrow";

const theme = createTheme({
	components: {
	  MuiCssBaseline: {
		styleOverrides: {
		  body: {
			scrollbarColor: "#6b6b6b #2b2b2b",
			"&::-webkit-scrollbar, & *::-webkit-scrollbar": {
			  backgroundColor: "#2b2b2b",
			},
			"&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
			  borderRadius: 8,
			  backgroundColor: "#6b6b6b",
			  minHeight: 24,
			  border: "3px solid #2b2b2b",
			},
			"&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
			  backgroundColor: "#959595",
			},
			"&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
			  backgroundColor: "#959595",
			},
			"&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
			  backgroundColor: "#959595",
			},
			"&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
			  backgroundColor: "#2b2b2b",
			},
		  },
		},
	  },
	},
  });
  
function App(props) {
	const {config} = props;
	const account = useAccount();

	const {creditScore, creditStatus, setCreditStatus, calculateCredit} = useCredit(account.address);

	return (
		<ThemeProvider theme={theme}>
			<div className="App" >
				<Header connectButton={<ConnectButton />} account={account} />
				<div className="mainWindow">
					{account.isConnected && 
					<Routes>
						<Route path='/' element={<Dashboard account={account} config={config} creditScore={creditScore} creditStatus={creditStatus} setCreditStatus={setCreditStatus} calculateCredit={calculateCredit}/>}></Route>
						<Route path='/swap' element={<Swap  account={account} />}></Route>
						<Route path='/borrow' element={<QuickBorrow  account={account} />}></Route>
					</Routes>
					}

					{!account.isConnected &&
						<>
						<div className='box' style={{width: '50%', height: '60vh', display: 'flex', flexDirection: 'column', 'alignItems': 'center', justifyContent: 'center'}}>
							<div style={{fontSize: '3em'}}>
								Please connect your wallet!
							</div>
							<div style={{fontSize: '5em'}}>
							<DisconnectOutlined /></div>
		
						</div>
						</>
					}

				</div>
			</div>
		</ThemeProvider>
	);
}

export default App;
