// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMainRouter {
    function deposit(address _depositor, uint64 _sourceChainSelector, address _token, uint256 _amount) external;
    function burn(address _burner, uint64 _sourceChainSelector, uint256 _amount) external;
    function depositAndMint(
        address _depositor, 
        uint64 _chainSelector, 
        address _token, 
        uint256 _amount,
        uint64 _destinationChainSelector,
        address _receiver, 
        uint256 _amountToMint
    )   external;
    function burnAndMint(
        address _burner,
        uint64 _chainSelector,
        uint256 _amount,
        uint64 _destinationChainSelector,
        address _receiver
    ) external;

    function liquidate(
        uint64 _sourceChainSelector,
        address _liquidatedUser,
        address _token, 
        uint64 _chainSelector, 
        address _receiver, 
        uint256 _amountToCover,
        address sender
    )   external;
}