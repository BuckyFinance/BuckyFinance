// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMainRouter {
    function deposit(address _depositor, uint64 _sourceChainSelector, address _token, uint256 _amount) external;
    function burn(address _burner, uint64 _sourceChainSelector, uint256 _amount) external;
}