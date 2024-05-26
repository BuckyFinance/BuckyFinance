import "./App.css";
import Header from "./components/Header"
import Swap from "./components/Swap"
import Tokens from "./components/Tokens"
import {Routes, Route} from 'react-router-dom'
import {useConnect, useAccount} from "wagmi"
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
	return (
		<ThemeProvider theme={theme}>
			<div className="App" >
				<Header connectButton={<ConnectButton />} />
				<div className="mainWindow">
					<Routes>
						<Route path='/' element={<Swap account={account} config={config} />}></Route>
						<Route path='/tokens' element={<Tokens/>}></Route>
					</Routes>
				</div>
			</div>
			</ThemeProvider>
	);
}

export default App;
