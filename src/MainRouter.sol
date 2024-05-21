// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { CCIPBase } from "./library/CCIPBase.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { OracleLib } from "./library/OracleLib.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract MainRouter is CCIPBase {
    using OracleLib for AggregatorV3Interface;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);
    error HealthFactorTooLow();
    error AmountHasToBeGreaterThanZero();
    error TokenNotAllowed(uint64 chainSelector, address token);
    error TokenAlreadyAllowed(uint64 _chainSelector, address _token);

    enum TransactionReceive {
        DEPOSIT,
        BURN
    }

    enum TransactionSend {
        REDEEM,
        MINT
    }

    EnumerableSet.UintSet private _allowedChains;

    // User => Chain Selector => Token => Amount
    mapping (address => mapping(uint64 => mapping(address => uint256))) public deposited;

    // Chain Selector => Token => isAllowed
    mapping (uint64 => mapping(address => bool)) isAllowedTokens;
    mapping (uint64 => EnumerableSet.AddressSet) allowedTokens;

    // Chain Selector => Token => priceFeed
    mapping (uint64 => mapping(address => address)) priceFeeds;
    
    // User => Chain selector => Amount minted
    mapping (address => mapping(uint64 => uint256)) public minted;

    mapping (address => uint256) public feePay;

    uint256 private constant FEED_PRECISION = 1e10;
    uint256 private constant LIQUIDATION_THRESHOLD = 50;
    uint256 private constant LIQUIDATION_PRECISION = 100;
    uint256 private constant LIQUIDATION_BONUS = 10;
    uint256 private constant MIN_HEALTH_FACTOR = 1e18;
    uint256 private constant PRECISION = 1e18;

    constructor (address _router) CCIPBase(_router) {}
    
    receive() external payable {
        feePay[msg.sender] += msg.value;
    }

    modifier onlyAllowedToken(uint64 _chainSelector, address _token) {
        if (!isAllowedTokens[_chainSelector][_token]){
            revert TokenNotAllowed(_chainSelector, _token);
        }
        _;
    }

    function redeem(
        uint64 _destinationChainSelector, 
        address _receiver, 
        address _token, 
        uint256 _amount
    )   external payable 
        onlyOwner 
        onlyAllowedToken(_destinationChainSelector, _token) 
    {
        if (_amount == 0){
            revert AmountHasToBeGreaterThanZero();
        }
        feePay[msg.sender] += msg.value;
        deposited[msg.sender][_destinationChainSelector][_token] -= _amount;

        if (!_checkHealthFactor(msg.sender)){
            revert HealthFactorTooLow();
        }

        bytes memory _data = abi.encode(TransactionSend.REDEEM, abi.encode(msg.sender, _token, _amount));
        _ccipSend(_destinationChainSelector, _receiver, _data);
    }

    function mint(
        uint64 _destinationChainSelector,
        address _receiver, 
        uint256 _amount
    )   external payable 
        onlyOwner 
    {
        if (_amount == 0){
            revert AmountHasToBeGreaterThanZero();
        }

        feePay[msg.sender] += msg.value;
        minted[msg.sender][_destinationChainSelector] += _amount;

        if (!_checkHealthFactor(msg.sender)){
            revert HealthFactorTooLow();
        }

        bytes memory _data = abi.encode(TransactionSend.MINT, abi.encode(msg.sender, _amount));
        _ccipSend(_destinationChainSelector, _receiver, _data);
    }

    function addAllowedToken(uint64 _chainSelector, address _token, address _priceFeed) external onlyOwner{
        if (isAllowedTokens[_chainSelector][_token]){
            revert TokenAlreadyAllowed(_chainSelector, _token);
        }
        isAllowedTokens[_chainSelector][_token] = true;
        allowedTokens[_chainSelector].add(_token);
        priceFeeds[_chainSelector][_token] = _priceFeed;
    }

    function removeAllowedToken(
        uint64 _chainSelector,
        address _token
    )    external 
        onlyOwner 
        onlyAllowedToken(_chainSelector, _token) 
    {
        isAllowedTokens[_chainSelector][_token] = false;
        allowedTokens[_chainSelector].remove(_token);
        priceFeeds[_chainSelector][_token] = address(0);
    }


    function _ccipSend(
        uint64 _destinationChainSelector,
        address _receiver,
        bytes memory _data
    )   internal 
        onlyAllowListedDestinationChain(_destinationChainSelector)
        validateReceiver(_receiver)
        returns (bytes32 _messageId) 
    {
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            _receiver,
            _data,
            address(0)
        );

        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(_destinationChainSelector, _message);

        if (feePay[msg.sender] < _fees){
            revert NotEnoughFeePay(feePay[msg.sender], _fees);
        }

        _messageId = _router.ccipSend{value: _fees}(_destinationChainSelector, _message);
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) 
        internal 
        onlyAllowListed(
            message.sourceChainSelector, 
            abi.decode(message.sender, (address))
        )
        override 
    {
        (TransactionReceive _transactionType, bytes memory _data) = abi.decode(message.data, (TransactionReceive, bytes));
        uint64 sourceChainSelector = message.sourceChainSelector;
        if (_transactionType == TransactionReceive.DEPOSIT) {
            (address _depositor, address _token, uint256 _amount) = abi.decode(_data, (address, address, uint256));
            deposited[_depositor][sourceChainSelector][_token] += _amount;
        } else if (_transactionType == TransactionReceive.BURN) {
            (address _burner, uint256 _amount) = abi.decode(_data, (address, uint256));
            minted[_burner][sourceChainSelector] -= _amount;
        }
    }

    function _checkHealthFactor(address _user) public view returns(bool) {
        return true;
    }

    function getUserInformation(address _user, uint64 _chainSelector, address _token) external view returns (uint256) {
        return deposited[_user][_chainSelector][_token];
    }



    function getUserCollateralOnChainValue(
        address _user,
        uint64 _chainSelector
    )   public
        view
        returns (uint256 totalAmount)
    {
        EnumerableSet.AddressSet storage _chainAllowedTokens = allowedTokens[_chainSelector];
        uint16 _tokenLength = uint16(_chainAllowedTokens.length());

        for (uint i = 0; i < _tokenLength; i++) {
            address _token = _chainAllowedTokens.at(i);
            totalAmount += getUserCollateralValue(_user, _chainSelector, _token);
        }
    }

    function getUserCollateralValue(
        address _user,
        uint64 _chainSelector,
        address _token
    )   public 
        view
        returns (uint256) 
    {
        return _getCollateralValue(_chainSelector, _token, _getUserDepositedAmount(_user, _chainSelector, _token));
    }

    function _getUserDepositedAmount(
        address _user,
        uint64 _chainSelector,
        address _token
    )   public
        view
        returns (uint256)
    {
        return deposited[_user][_chainSelector][_token];
    }

    function _getCollateralValue(
        uint64 _chainSelector, 
        address _token,
        uint256 _amount
    )   public 
        view 
        onlyAllowedToken(_chainSelector, _token)
        returns (uint256) 
    {
        AggregatorV3Interface _priceFeed = AggregatorV3Interface(priceFeeds[_chainSelector][_token]);
        (, int256 _price, , , ) = _priceFeed.staleCheckLatestRoundData();
        return (uint256(_price) * FEED_PRECISION) * _amount / PRECISION;
    }
    
}