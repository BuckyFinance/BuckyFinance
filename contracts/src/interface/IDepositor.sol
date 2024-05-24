// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDepositor {
    function redeem(address _receiver, address _token, uint256 _amount) external;
}