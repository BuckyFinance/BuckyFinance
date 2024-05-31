// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { CCIPBase } from "./library/CCIPBase.sol";
import { FunctionsBase } from "./library/FunctionsBase.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import { OracleLib } from "./library/OracleLib.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import { IDepositor } from "./interface/IDepositor.sol";
import { IMinter } from "./interface/IMinter.sol";


contract MainRouter is CCIPBase, FunctionsBase {
    using OracleLib for AggregatorV3Interface;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using FunctionsRequest for FunctionsRequest.Request;
    
    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);
    error HealthFactorTooLow();
    error AmountHasToBeGreaterThanZero();
    error TokenNotAllowed(uint64 chainSelector, address token);
    error TokenAlreadyAllowed(uint64 _chainSelector, address _token);
    error ExceedsMaxLTV();
    error NotAllowed();
    error HealthFactorNotLowEnoughToBeLiquidated();

    event Deposit(address indexed user, uint64 indexed chainSelector, address indexed token, uint256 amount);
    event Redeem(address indexed user, uint64 indexed chainSelector, address indexed token, uint256 amount);
    event Mint(address indexed user, uint64 indexed chainSelector, uint256 amount);
    event Burn(address indexed user, uint64 indexed chainSelector, uint256 amount);


    enum TransactionReceive {
        DEPOSIT,
        BURN,
        DEPOSIT_MINT,
        BURN_MINT,
        LIQUIDATE
    }

    enum TransactionSend {
        REDEEM,
        MINT
    }

    address private avalancheDepositor;
    address private avalancheMinter;

    mapping (address => uint16) private userActivityCredit;
    mapping (address => uint256) private userProtocolCredit;

    // User => Chain Selector => Token => Amount
    mapping (address => mapping(uint64 => mapping(address => uint256))) private deposited;

    // Chain Selector => Token => isAllowed
    mapping (uint64 => mapping(address => bool)) private isAllowedTokens;
    mapping (uint64 => EnumerableSet.AddressSet) private allowedTokens;
    
    // Chain Selector => Token => Token Decimals
    mapping (uint64 => mapping(address => uint8)) private tokenDecimals;



    // Chain Selector => Token => priceFeed
    mapping (uint64 => mapping(address => address)) private priceFeeds;
    
    // User => Chain selector => Amount minted
    mapping (address => mapping(uint64 => uint256)) private minted;

    mapping (address => uint256) private feePay;

    uint256 private ccipGasLimit = 300_000;

    uint16 public constant BASE_ACTIVITY_CREDIT = 300;

    uint256 public constant BASE_LTV = 65e18;
    uint256 public constant MAX_LTV = 75e18;
    uint256 public constant LIQUIDATION_THRESHOLD = 80e18;
    uint256 public constant LIQUIDATION_PENALTY = 6e18;

    uint256 public constant MIN_HEALTH_FACTOR = 1e18;
    uint256 public constant FEED_PRECISION = 1e10;
    uint256 public constant LIQUIDATION_PRECISION = 1e20;
    uint256 public constant PRECISION = 1e18;
    uint256 public constant CREDIT_PRECISION = 1e3;

    constructor (
        uint64 _chainSelector,
        address _router, 
        address _functionsRouter, 
        bytes32 _donId
    )   CCIPBase(_chainSelector, _router) 
        FunctionsBase(_functionsRouter, _donId) {}
    
    receive() external payable {
        feePay[msg.sender] += msg.value;
    }

    modifier onlyAllowedToken(uint64 _chainSelector, address _token) {
        if (!isAllowedTokens[_chainSelector][_token]){
            revert TokenNotAllowed(_chainSelector, _token);
        }
        _;
    }

    modifier onlyAvalancheDepositor(address _caller) {
        if (avalancheDepositor != _caller){
            revert NotAllowed();
        }
        _;
    }

    modifier onlyAvalancheMinter(address _caller) {
        if (avalancheMinter != _caller){
            revert NotAllowed();
        }
        _;
    }

    function setAvalancheDepositor(address _depositorContract) external onlyOwner{
        avalancheDepositor = _depositorContract;
    }

    function setAvalancheMinter(address _minterContract) external onlyOwner {
        avalancheMinter = _minterContract;
    }

    function addAllowedToken(uint64 _chainSelector, address _token, address _priceFeed, uint8 _tokenDecimal) external onlyOwner {
        if (isAllowedTokens[_chainSelector][_token]){
            revert TokenAlreadyAllowed(_chainSelector, _token);
        }
        isAllowedTokens[_chainSelector][_token] = true;
        allowedTokens[_chainSelector].add(_token);
        priceFeeds[_chainSelector][_token] = _priceFeed;
        tokenDecimals[_chainSelector][_token] = _tokenDecimal;
    }

    function removeAllowedToken(
        uint64 _chainSelector,
        address _token
    )   external 
        onlyOwner 
        onlyAllowedToken(_chainSelector, _token) 
    {
        isAllowedTokens[_chainSelector][_token] = false;
        allowedTokens[_chainSelector].remove(_token);
        priceFeeds[_chainSelector][_token] = address(0);
        tokenDecimals[_chainSelector][_token] = 0;
    }
    function changePriceFeed(
        uint64 _chainSelector,
        address _token,
        address _priceFeed
    )   external 
        onlyOwner 
        onlyAllowedToken(_chainSelector, _token) 
    {
        priceFeeds[_chainSelector][_token] = _priceFeed;
    }

    function setCCIPGasLimit(uint256 _newGasLimit) external onlyOwner {
        ccipGasLimit = _newGasLimit;
    }
    
    function withdrawFeePay(uint256 _amount) external {
        require(_amount <= feePay[msg.sender], "Not enough fee pay");
        feePay[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    } 

    function redeem(
        uint64  _destinationChainSelector, 
        address _receiver, 
        address _token, 
        uint256 _amount
    )   external payable 
        onlyAllowedToken(_destinationChainSelector, _token) 
    {
        if (_amount == 0){
            revert AmountHasToBeGreaterThanZero();
        }
        feePay[msg.sender] += msg.value;
        _redeem(_destinationChainSelector, _receiver, _token, _amount, msg.sender, msg.sender);
    }

    function mint(
        uint64 _destinationChainSelector,
        address _receiver, 
        uint256 _amount
    )   external payable 
    {
        feePay[msg.sender] += msg.value;
        _mint(_destinationChainSelector, _receiver, msg.sender, _amount);
    }

    function depositAndMint(
        address _depositor, 
        uint64 _chainSelector, 
        address _token, 
        uint256 _amount,
        uint64 _destinationChainSelector,
        address _receiver, 
        uint256 _amountToMint
    )   external onlyAvalancheDepositor(msg.sender) {
        _deposit(_depositor, _chainSelector, _token, _amount);
        _mint(_destinationChainSelector, _receiver, _depositor, _amountToMint);
    }

    function burnAndMint(
        address _burner,
        uint64 _chainSelector,
        uint256 _amount,
        uint64 _destinationChainSelector,
        address _receiver
    ) external onlyAvalancheMinter(msg.sender) {
        _burn(_burner, _chainSelector, _amount);
        _mint(_destinationChainSelector, _receiver, _burner, _amount);
    }

    function deposit(address _depositor, uint64 _sourceChainSelector, address _token, uint256 _amount) external onlyAvalancheDepositor(msg.sender) {
        _deposit(_depositor, _sourceChainSelector, _token, _amount);
    }

    function burn(address _burner, uint64 _sourceChainSelector, uint256 _amount) external onlyAvalancheMinter(msg.sender) {
        _burn(_burner, _sourceChainSelector, _amount);
    }

    function liquidate(
        uint64 _sourceChainSelector,
        address _liquidatedUser,
        address _token, 
        uint64 _destinationChainSelector, 
        address _receiver, 
        uint256 _amountToCover,
        address _sender
    )   external onlyAvalancheMinter(msg.sender)
    {   
        _liquidate(_sourceChainSelector, _liquidatedUser, _token, _destinationChainSelector, _receiver, _amountToCover, _sender);
    }

    function _liquidate(
        uint64 _sourceChainSelector,
        address _liquidatedUser,
        address _token, 
        uint64 _destinationChainSelector, 
        address _receiver, 
        uint256 _amountToCover,
        address _sender
    )   internal
    {   
        uint256 userHealthFactor = getUserHealthFactor(_liquidatedUser);
        if (userHealthFactor > MIN_HEALTH_FACTOR){
            revert HealthFactorNotLowEnoughToBeLiquidated();
        }
        _burn(_liquidatedUser, _sourceChainSelector, _amountToCover);
        uint256 _usdToRedeem = _amountToCover + _amountToCover * LIQUIDATION_PENALTY / LIQUIDATION_PRECISION;
        uint256 _amount = min(deposited[_liquidatedUser][_destinationChainSelector][_token], convertUSDIntoToken(_usdToRedeem, _destinationChainSelector, _token));
        _redeem(_destinationChainSelector, _receiver, _token, _amount, _liquidatedUser, _sender);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a <= b ? a : b;
    }

    function _deposit(address _depositor, uint64 _sourceChainSelector, address _token, uint256 _amount) internal {
        deposited[_depositor][_sourceChainSelector][_token] += _amount;
        emit Deposit(_depositor, _sourceChainSelector, _token, _amount);
    }

    function _redeem(
        uint64  _destinationChainSelector, 
        address _receiver, 
        address _token, 
        uint256 _amount,
        address _from,
        address _to
    )   internal {
        if (_amount == 0){
            revert AmountHasToBeGreaterThanZero();
        }

        deposited[_from][_destinationChainSelector][_token] -= _amount;

        if (!checkHealthFactor(_from)){
            revert HealthFactorTooLow();
        }

        if (chainSelector == _destinationChainSelector) {
            IDepositor(_receiver).redeem(_from, _to, _token, _amount);
            return;
        }

        bytes memory _data = abi.encode(TransactionSend.REDEEM, abi.encode(_from, _to, _token, _amount));
        _ccipSend(_to, _destinationChainSelector, _receiver, TransactionSend.REDEEM, _token, _amount, _data);
        
    }

    function _mint(uint64 _destinationChainSelector, address _receiver, address _sender, uint256 _amount) internal {
        if (_amount == 0){
            revert AmountHasToBeGreaterThanZero();
        }
        minted[_sender][_destinationChainSelector] += _amount;

        if (!checkExceedMaxLTV(_sender)){
            revert ExceedsMaxLTV();
        }

        if (chainSelector == _destinationChainSelector) {
            IMinter(_receiver).mint(_sender, _amount);
            return;
        }

        bytes memory _data = abi.encode(TransactionSend.MINT, abi.encode(_sender, _amount));
        _ccipSend(_sender, _destinationChainSelector, _receiver, TransactionSend.MINT, address(0), _amount, _data);

    }

    function _burn(address _burner, uint64 _sourceChainSelector, uint256 _amount) internal {
        minted[_burner][_sourceChainSelector] -= _amount;
        emit Burn(_burner, _sourceChainSelector, _amount);
    }

    function getRedeemFee(
        uint64  _destinationChainSelector, 
        address _receiver, 
        address _token, 
        uint256 _amount
    ) public view returns (uint256) {
        if (chainSelector == _destinationChainSelector) {
            return 0;
        }

        bytes memory _data = abi.encode(TransactionSend.REDEEM, abi.encode(msg.sender, _token, _amount));
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            _receiver,
            _data,
            address(0),
            ccipGasLimit
        );

        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(_destinationChainSelector, _message);
        return _fees;
    }

    function getMintFee(
        uint64 _destinationChainSelector,
        address _receiver, 
        uint256 _amount
    ) public view returns (uint256) {
        if (chainSelector == _destinationChainSelector) {
            return 0;
        }

        bytes memory _data = abi.encode(TransactionSend.MINT, abi.encode(msg.sender, _amount));
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            _receiver,
            _data,
            address(0),
            ccipGasLimit
        );

        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(_destinationChainSelector, _message);
        return _fees;
    }



    function getMaximumAllowedMinting(address _user) public view returns (uint256) {
        uint256 _userLTV = calculateLTV(_user);
        uint256 _totalCollateral = getUserOverallCollateralValue(_user);
        return _totalCollateral * _userLTV / LIQUIDATION_PRECISION;
    }

    function getUserFractionToLTV(address _user) public view returns (uint256 fraction) {
        uint256 _userLTV = calculateLTV(_user);
        (uint256 _totalCollateral, uint256 _totalMinted) = getUserOverallInformation(_user);
        fraction = calculateUserFractionToLTV(_totalCollateral, _totalMinted, _userLTV);
    }

    function getUserHealthFactor(address _user) public view returns (uint256 healthFactor) {
        (uint256 _totalCollateral, uint256 _totalMinted) = getUserOverallInformation(_user);
        healthFactor = calculateHealthFactor(_totalCollateral, _totalMinted);
    }

    function calculateUserFractionToLTV(uint256 _totalCollateral, uint256 _totalMinted, uint256 _ratio) public pure returns (uint256 fraction) {
        if (_totalMinted == 0){
            return type(uint256).max;
        }
        return calculateFraction(_totalCollateral, _totalMinted, _ratio);
    }

    function calculateHealthFactor(uint256 _totalCollateral, uint256 _totalMinted) public pure returns (uint256 healthFactor) {
        if (_totalMinted == 0){
            return type(uint256).max;
        }
        return calculateFraction(_totalCollateral, _totalMinted, LIQUIDATION_THRESHOLD);
    }

    function calculateFraction(uint256 _totalCollateral, uint256 _totalMinted, uint256 _ratio) public pure returns (uint256 answer) {
        answer = (_totalCollateral * _ratio) / LIQUIDATION_PRECISION;
        answer = (answer * PRECISION) / _totalMinted;
    }
    
    function checkHealthFactor(address _user) public view returns(bool) {
        return getUserHealthFactor(_user) > MIN_HEALTH_FACTOR;
    }

    function checkExceedMaxLTV(address _user) public view returns (bool) {
        return getUserFractionToLTV(_user) > MIN_HEALTH_FACTOR;
    }

    function calculateLTV(address _user) public view returns(uint256){
        return BASE_LTV + convertCreditToLTV(userActivityCredit[_user] - userProtocolCredit[_user]);
    }

    function convertCreditToLTV(uint256 _activityCredit) public pure returns (uint256){
        return (MAX_LTV - BASE_LTV) * _activityCredit / CREDIT_PRECISION;                          
    }

    function getUserOverallInformation(
        address user
    )   public
        view
        returns (uint256 totalCollateral, uint256 totalMinted)
    {
        totalCollateral = getUserOverallCollateralValue(user);
        totalMinted = getUserMintedOverall(user);
    }

    function getUserOnChainInformation(
        address _user,
        uint64 _chainSelector
    )   public
        view
        returns (uint256 totalCollateral, uint256 totalMinted)
    {
        totalCollateral = getUserCollateralOnChainValue(_user, _chainSelector);
        totalMinted = getUserMintedOnChain(_user, _chainSelector);
    }

    function getUserMintedOverall(
        address _user
    )   public
        view
        returns (uint256 totalAmount)
    {
        EnumerableSet.UintSet storage _allowedChains = allowedChains;
        uint16 _chainLength = uint16(_allowedChains.length());
        for (uint i = 0; i < _chainLength; i++) {
            uint64 _chainSelector = uint64(_allowedChains.at(i));
            totalAmount += getUserMintedOnChain(_user, _chainSelector);
        }
    }

    function getUserMintedOnChain(
        address _user,
        uint64 _chainSelector
    )   public
        view
        returns (uint256 amount)
    {
        return minted[_user][_chainSelector];
    }

    function getUserOverallCollateralValue(
        address _user
    )   public
        view
        returns (uint256 totalAmount)
    {
        EnumerableSet.UintSet storage _allowedChains = allowedChains;
        uint16 _chainLength = uint16(_allowedChains.length());
        for (uint i = 0; i < _chainLength; i++) {
            uint64 _chainSelector = uint64(_allowedChains.at(i));
            totalAmount += getUserCollateralOnChainValue(_user, _chainSelector);
        }
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
        return getCollateralValue(_chainSelector, _token, getUserDepositedAmount(_user, _chainSelector, _token));
    }

    function getUserDepositedAmount(
        address _user,
        uint64 _chainSelector,
        address _token
    )   public
        view
        returns (uint256)
    {
        return deposited[_user][_chainSelector][_token];
    }

    function getCollateralValue(
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
        return (uint256(_price) * FEED_PRECISION) * _amount * 10**(18 - tokenDecimals[_chainSelector][_token]) / PRECISION;
    }

    function getDeposited(
        address _user,
        uint64 _chainSelector,
        address _token
    )   public
        view
        returns (uint256)
    {
        return deposited[_user][_chainSelector][_token];
    }

    function getUserActivityCredit(address _user) public view returns (uint16){
        return userActivityCredit[_user];
    }

    function getUserProtocolCredit(address _user) public view returns (uint256){
        return userProtocolCredit[_user];
    }
    
    function getIsAllowedTokens(uint64 _chainSelector, address _token) public view returns (bool){
        return isAllowedTokens[_chainSelector][_token];
    }

    function getPriceFeeds(uint64 _chainSelector, address _token) public view returns (address){
        return priceFeeds[_chainSelector][_token];
    }
    
    function getMinted(address _user, uint64 _chainSelector) public view returns (uint256){
        return minted[_user][_chainSelector];
    }

    function getFeePay(address _user) public view returns (uint256){
        return feePay[_user];
    }

    function convertUSDIntoToken(uint256 _amount, uint64 _destinationChainSelector, address _token) public view returns (uint256){
        uint256 _price = getTokenPrice(_token);
        /// 1000 * 1e18 usd
        // 3000 * 1e8
        /// 1/3 * 1e10
        // 0.3 * 1e10
        return (_amount * PRECISION) / (_price * FEED_PRECISION) / 10**(18 - tokenDecimals[_destinationChainSelector][_token]);
    }

    function getTokenPrice(address _token) public view returns (uint256){
        AggregatorV3Interface _priceFeed = AggregatorV3Interface(priceFeeds[uint64(allowedChains.at(0))][_token]);
        (, int256 _price, , , ) = _priceFeed.staleCheckLatestRoundData();
        return uint256(_price);
    }

    

    function getAvalancheDepositor() public view returns (address) {
        return avalancheDepositor;
    }

    function getAvalancheMinter() public view returns (address) {
        return avalancheMinter;
    }

    function getCCIPGasLimit() public view returns (uint256) {
        return ccipGasLimit;
    }

    function getAllowedTokensOnChain(uint64 _chainSelector) public view returns(address[] memory){
        address[] memory _tokens = new address[](allowedTokens[_chainSelector].length());
        for (uint i = 0; i < allowedTokens[_chainSelector].length(); i++) {
            _tokens[i] = allowedTokens[_chainSelector].at(i);
        }
        return _tokens;
    }


    // -----------CHAINLINK CCIP ----------- //

    function _ccipSend(
        address _sender,
        uint64 _destinationChainSelector,
        address _receiver,
        TransactionSend _transactionType,
        address _token,
        uint256 _amount,
        bytes memory _data
    )   internal 
        onlyAllowListedDestinationChain(_destinationChainSelector)
        validateReceiver(_receiver)
        returns (bytes32 _messageId) 
    {
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            _receiver,
            _data,
            address(0),
            ccipGasLimit
        );

        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(_destinationChainSelector, _message);

        if (feePay[_sender] < _fees){
            revert NotEnoughFeePay(feePay[_sender], _fees);
        }

        feePay[_sender] -= _fees;

        _messageId = _router.ccipSend{value: _fees}(_destinationChainSelector, _message);

        if (_transactionType == TransactionSend.REDEEM) {
            emit Redeem(_sender, _destinationChainSelector, _token, _amount);
        } else if (_transactionType == TransactionSend.MINT) {
            emit Mint(_sender, _destinationChainSelector, _amount);
        }
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
        uint64 _sourceChainSelector = message.sourceChainSelector;
        if (_transactionType == TransactionReceive.DEPOSIT) {
            (address _depositor, address _token, uint256 _amount) = abi.decode(_data, (address, address, uint256));
            _deposit(_depositor, _sourceChainSelector, _token, _amount);
        } else if (_transactionType == TransactionReceive.BURN) {
            (address _burner, uint256 _amount) = abi.decode(_data, (address, uint256));
            _burn(_burner, _sourceChainSelector, _amount);
        } else if (_transactionType == TransactionReceive.DEPOSIT_MINT) {
            (address _depositor, address _token, uint256 _amount, uint64 _destinationChainSelector, address _receiver, uint256 _amountToMint) = abi.decode(_data, (address, address, uint256, uint64, address, uint256));
            _deposit(_depositor, _sourceChainSelector, _token, _amount);
            _mint(_destinationChainSelector, _receiver, _depositor, _amountToMint);
        } else if (_transactionType == TransactionReceive.BURN_MINT) {
            (address _burner, uint256 _amount, uint64 _destinationChainSelector, address _receiver) = abi.decode(_data, (address, uint256, uint64, address));
            _burn(_burner, _sourceChainSelector, _amount);
            _mint(_destinationChainSelector, _receiver, _burner, _amount);
        } else if (_transactionType == TransactionReceive.LIQUIDATE) {
            (address _liquidatedUser, address _token, uint64 _destinationChainSelector, address _receiver, uint256 _amountToCover, address _sender) = abi.decode(_data, (address, address, uint64, address, uint256, address));
            _liquidate(_sourceChainSelector, _liquidatedUser, _token, _destinationChainSelector, _receiver, _amountToCover, _sender);
        }
    }
    
    /// -----------CHAINLINK FUNCTIONS----------- ///

    function sendRequestToCalculateActivityCredit(address _user, string[] calldata _args) public returns (bytes32 _requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        if (_args.length > 0){
            req.setArgs(_args);
        }

        _requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        requestIdToUser[_requestId] = _user;
    }

    function fulfillRequest(bytes32 _requestId, bytes memory _response, bytes memory _err) internal override {
        address _user = requestIdToUser[_requestId];
        uint16 _returnedCredit = 0;
        if (_response.length > 0){
            _returnedCredit = uint16(uint256(bytes32(_response)));
        }
        
        if (_returnedCredit > 0) {
            userActivityCredit[_user] = _returnedCredit;
        }

        if (userActivityCredit[_user] == 0){
            userActivityCredit[_user] = BASE_ACTIVITY_CREDIT;
        }

        emit Response(_user, _requestId, _returnedCredit, _response, _err);
    }
}