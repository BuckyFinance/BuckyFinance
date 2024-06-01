// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { CCIPBase } from "./library/CCIPBase.sol";
import { IMainRouter } from "./interface/IMainRouter.sol";

contract Depositor is CCIPBase {
    using SafeERC20 for IERC20;

    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);
    error NotAllowedToken(address token);
    error NotAllowed();

    event Deposit(address indexed user, address indexed token, uint256 indexed amount);
    event Redeem(address indexed _from, address indexed to, address indexed token, uint256 amount);

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
    
    mapping (address => mapping(address => uint256)) private deposited;
    mapping (address => uint256) private feePay;
    mapping (address => bool) private isAllowedToken;


    address private mainRouter;
    uint64 private mainRouterChainSelector;

    uint256 private ccipDepositGasLimit = 500_000;
    uint256 private ccipDepositAndMintGasLimit = 1_000_000;

    constructor(uint64 _chainSelector, address _router, uint64 _mainRouterChainSelector, address _mainRouter) CCIPBase(_chainSelector, _router) {
        mainRouter = _mainRouter;
        mainRouterChainSelector = _mainRouterChainSelector;
    }

    receive() external payable {
        feePay[msg.sender] += msg.value;
    }

    modifier onlyAllowedToken(address _token) {
        if (!isAllowedToken[_token]){
            revert NotAllowedToken(_token);
        }
        _;
    }

    modifier onlyMainRouter(address caller){
        if (caller != mainRouter){
            revert NotAllowed();
        }
        _;
    }

    function setMainRouter(address _newMainRouter) external onlyOwner {
        mainRouter = _newMainRouter;
    }

    function setMainRouterChainSelector(uint64 _newMainRouterChainSelector) external onlyOwner {
        mainRouterChainSelector = _newMainRouterChainSelector;
    }

    function setAllowedToken(address _token, bool _isAllowed) external onlyOwner {
        isAllowedToken[_token] = _isAllowed;
    }

    function setCCIPDepositGasLimit(uint256 _newGasLimit) external onlyOwner {
        ccipDepositGasLimit = _newGasLimit;
    }

    function setCCIPDepositAndMintGasLimit(uint256 _newGasLimit) external onlyOwner {
        ccipDepositAndMintGasLimit = _newGasLimit;
    }

    function deposit(address _token, uint256 _amount) external payable onlyAllowedToken(_token) {
        feePay[msg.sender] += msg.value;
        _deposit(msg.sender, _token, _amount);

        if (chainSelector == mainRouterChainSelector) {
            IMainRouter(mainRouter).deposit(msg.sender, chainSelector, _token, _amount);
            emit Deposit(msg.sender, _token, _amount);
            return;
        }

        bytes memory _data = abi.encode(TransactionReceive.DEPOSIT, abi.encode(msg.sender, _token, _amount));
        _ccipSend(msg.sender, _token, _amount, _data, ccipDepositGasLimit);
    }

    function depositAndMint(address _token, uint256 _amount, uint64 _destinationChainSelector,address _receiver, uint256 _amountToMint) external payable onlyAllowedToken(_token) {
        feePay[msg.sender] += msg.value;
        _deposit(msg.sender, _token, _amount);

        if (chainSelector == mainRouterChainSelector) {
            emit Deposit(msg.sender, _token, _amount);
            IMainRouter(mainRouter).depositAndMint(msg.sender, chainSelector, _token, _amount, _destinationChainSelector, _receiver, _amountToMint);
            return;
        }

        bytes memory _data = abi.encode(TransactionReceive.DEPOSIT_MINT, abi.encode(msg.sender, _token, _amount, _destinationChainSelector, _receiver, _amountToMint));
        _ccipSend(msg.sender, _token, _amount, _data, ccipDepositAndMintGasLimit);
    }

    function _deposit(address _sender, address _token, uint256 _amount) internal {
        IERC20(_token).safeTransferFrom(_sender, address(this), _amount);
        deposited[_sender][_token] += _amount;
    }

    function redeem(address _from, address _to, address _token, uint256 _amount) external onlyMainRouter(msg.sender){
        _redeem(_from, _to, _token, _amount);
    }

    function _redeem(address _from, address _to, address _token, uint256 _amount) internal onlyAllowedToken(_token) {
        deposited[_from][_token] -= _amount;
        IERC20(_token).safeTransfer(_to, _amount);
    }


    function _ccipSend(
        address _sender,
        address _token,
        uint256 _amount,
        bytes memory _data,
        uint256 _gasLimit
    )   internal 
        onlyAllowListedDestinationChain(mainRouterChainSelector)
        validateReceiver(mainRouter)
        returns (bytes32 _messageId) 
    {
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            mainRouter, 
            _data,
            address(0),
            _gasLimit
        );

        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(mainRouterChainSelector, _message);

        if (feePay[_sender] < _fees){
            revert NotEnoughFeePay(feePay[_sender], _fees);
        }

        feePay[_sender] -= _fees;

        _messageId = _router.ccipSend{value: _fees}(
            mainRouterChainSelector,
            _message
        );

        emit Deposit(_sender, _token, _amount);
    }


    function _ccipReceive(Client.Any2EVMMessage memory message) 
        internal 
        onlyAllowListed(
            message.sourceChainSelector, 
            abi.decode(message.sender, (address))
        ) 
        override 
    {
        (TransactionSend _transactionType, bytes memory _data) = abi.decode(message.data, (TransactionSend, bytes));
        if (_transactionType == TransactionSend.REDEEM) {
            (address _from, address _to, address _token, uint256 _amount) = abi.decode(_data, (address, address, address, uint256));
            _redeem(_from, _to, _token, _amount);
            emit Redeem(_from, _to, _token, _amount);
        }
    }

    function withdrawFeePay(uint256 _amount) external {
        require(_amount <= feePay[msg.sender], "Not enough fee pay");
        feePay[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    } 

    function getDepositFee(address _token, uint256 _amount) public view returns(uint256) {
        if (chainSelector == mainRouterChainSelector) {
            return 0;
        }
        bytes memory _data = abi.encode(TransactionReceive.DEPOSIT, abi.encode(msg.sender, _token, _amount));
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            mainRouter,
            _data,
            address(0),
            ccipDepositGasLimit
        );
        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(mainRouterChainSelector, _message);
        return _fees;
    }

    function getDepositAndMintFee(address _token, uint256 _amount, uint64 _destinationChainSelector,address _receiver, uint256 _amountToMint) public view returns(uint256) {
        if (chainSelector == mainRouterChainSelector) {
            return 0;
        }
        bytes memory _data = abi.encode(TransactionReceive.DEPOSIT_MINT, abi.encode(msg.sender, _token, _amount, _destinationChainSelector, _receiver, _amountToMint));
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            mainRouter,
            _data,
            address(0),
            ccipDepositAndMintGasLimit
        );
        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(mainRouterChainSelector, _message);
        return _fees;
    }

    function getDeposited(address _user, address _token) public view returns (uint256) {
        return deposited[_user][_token];
    }

    function getFeePay(address _user) public view returns (uint256) {
        return feePay[_user];
    }

    function getIsAllowedToken(address _token) public view returns (bool) {
        return isAllowedToken[_token];
    }

    function getMainRouter() public view returns (address) {
        return mainRouter;
    }

    function getMainRouterChainSelector() public view returns (uint64) {
        return mainRouterChainSelector;
    }

    function getCCIPDepositGasLimit() public view returns (uint256) {
        return ccipDepositGasLimit;
    }

    function getCCIPDepositAndMintGasLimit() public view returns (uint256) {
        return ccipDepositAndMintGasLimit;
    }
}