// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";
import { Depositor } from "../../src/Depositor.sol";
import { ChainConfig } from "../config/ChainConfig.s.sol";

contract DepositAndMint is Script {
    function depositAndMint(address _token, uint256 _amount, uint64 _destinationChainSelector, address _receiver, uint256 _amountToMint, uint256 _amountEther) external {
        ChainConfig config = new ChainConfig();
        ChainConfig.ChainComponent memory chain = config.run();

        vm.startBroadcast();
        ERC20Mock(_token).approve(address(chain.depositor), _amount);
        Depositor(payable(chain.depositor)).depositAndMint{value: _amountEther, gas: 5000000}(_token, _amount, _destinationChainSelector, _receiver, _amountToMint);
        vm.stopBroadcast();
    }
}