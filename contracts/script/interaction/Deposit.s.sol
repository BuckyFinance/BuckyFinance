// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";
import { Depositor } from "../../src/Depositor.sol";
import { ChainConfig } from "../config/ChainConfig.s.sol";

contract Deposit is Script {
    function deposit(address _token, uint256 _amount, uint256 _amountEther) external {
        ChainConfig config = new ChainConfig();
        ChainConfig.ChainComponent memory chain = config.run();

        vm.startBroadcast();
        ERC20Mock(_token).approve(address(chain.depositor), _amount);
        Depositor(payable(chain.depositor)).deposit{value: _amountEther}(_token, _amount);
        vm.stopBroadcast();
    }
}