import "@fontsource/kanit"
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import '@rainbow-me/rainbowkit/styles.css';
import './index.css';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
	arbitrumSepolia,
	avalancheFuji,
	baseSepolia,
	optimismSepolia,
	polygonAmoy,
  	sepolia,
} from 'wagmi/chains';

import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    arbitrumSepolia,
	avalancheFuji,
	baseSepolia,
	optimismSepolia,
	{
		...polygonAmoy,
		iconBackground: '#c666fa',
		iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
	},
  	sepolia,
  ],
});

const queryClient = new QueryClient();


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider theme={darkTheme()}>
					<BrowserRouter>
						<App config={config} />
					</BrowserRouter>
					</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
  </React.StrictMode>
);
