// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { CCIPBase } from "./library/CCIPBase.sol";

contract Depositor is CCIPBase {
    using SafeERC20 for IERC20;

    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);
    error NotAllowedToken(address token);

    enum TransactionReceive {
        DEPOSIT,
        BURN
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

    constructor(address _router, uint64 _mainRouterChainSelector, address _mainRouter) CCIPBase(_router) {
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

    function setMainRouter(address _newMainRouter) external onlyOwner {
        mainRouter = _newMainRouter;
    }

    function setMainRouterChainSelector(uint64 _newMainRouterChainSelector) external onlyOwner {
        mainRouterChainSelector = _newMainRouterChainSelector;
    }

    function setAllowedToken(address _token, bool _isAllowed) external onlyOwner {
        isAllowedToken[_token] = _isAllowed;
    }

    function deposit(address _token, uint256 _amount) external payable onlyAllowedToken(_token) {
        feePay[msg.sender] += msg.value;
        _deposit(msg.sender, _token, _amount);
        bytes memory _data = abi.encode(TransactionReceive.DEPOSIT, abi.encode(msg.sender, _token, _amount));
        _ccipSend(msg.sender, _data);
    }

    function _deposit(address _sender, address _token, uint256 _amount) internal {
        IERC20(_token).safeTransferFrom(_sender, address(this), _amount);
        deposited[_sender][_token] += _amount;
    }

    function _redeem(address _receiver, address _token, uint256 _amount) internal onlyAllowedToken(_token) {
        deposited[_receiver][_token] -= _amount;
        IERC20(_token).safeTransfer(_receiver, _amount);
    }


    function _ccipSend(
        address _sender,
        bytes memory _data
    )   internal 
        onlyAllowListedDestinationChain(mainRouterChainSelector)
        validateReceiver(mainRouter)
        returns (bytes32 _messageId) 
    {
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            mainRouter, 
            _data,
            address(0)
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
            (address _user, address _token, uint256 _amount) = abi.decode(_data, (address, address, uint256));
            _redeem(_user, _token, _amount);
        }
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
}