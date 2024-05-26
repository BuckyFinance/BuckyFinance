// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { TokenConfig } from "../config/TokenConfig.s.sol";
import { ERC20Mock } from "../Mocks/ERC20Mock.sol";
import { Depositor } from "../../src/Depositor.sol";
import { ChainConfig } from "../config/ChainConfig.s.sol";

contract SetCCIPFee is Script {
    function setFee(uint256 _newValue) external {
        ChainConfig config = new ChainConfig();
        ChainConfig.ChainComponent memory chain = config.run();

        vm.startBroadcast();
        Depositor(payable(chain.depositor)).setCCIPDepositAndMintGasLimit(_newValue);
        vm.stopBroadcast();
    }
}