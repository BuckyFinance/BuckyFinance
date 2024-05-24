// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import { DSC } from "./DSC.sol";
import { CCIPBase } from "./library/CCIPBase.sol";


contract Minter is CCIPBase {
    using SafeERC20 for IERC20;

    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);

    event Minted(address indexed user, uint256 indexed amount);
    event Burned(address indexed user, uint256 indexed amount);

    enum TransactionReceive {
        DEPOSIT,
        BURN
    }

    enum TransactionSend {
        REDEEM,
        MINT
    }

    mapping (address => uint256) private minted;
    mapping (address => uint256) private feePay;


    DSC private immutable dsc;

    address private mainRouter;
    uint64 private mainRouterChainSelector;

    constructor(uint64 _chainSelector, address _router, uint64 _mainRouterChainSelector, address _mainRouter) CCIPBase(_chainSelector, _router) {
        mainRouter = _mainRouter;
        mainRouterChainSelector = _mainRouterChainSelector;
        dsc = new DSC();
    }

    receive() external payable {
        feePay[msg.sender] += msg.value;
    }

    function setMainRouter(address _newMainRouter) external onlyOwner {
        mainRouter = _newMainRouter;
    }

    function setMainRouterChainSelector(uint64 _newMainRouterChainSelector) external onlyOwner {
        mainRouterChainSelector = _newMainRouterChainSelector;
    }

    function burn(uint256 _amount) external {
        minted[msg.sender] -= _amount;
        IERC20(address(dsc)).safeTransferFrom(msg.sender, address(this), _amount);
        dsc.burn(_amount);
        
        bytes memory _data = abi.encode(TransactionReceive.BURN, abi.encode(msg.sender, _amount));
        _ccipSend(msg.sender, _amount, _data);
    }

    function _mint(address _receiver, uint256 _amount) internal {
        minted[_receiver] += _amount;
        dsc.mint(_receiver, _amount);
        emit Minted(_receiver, _amount);
    }

    function _ccipSend(
        address _sender,
        uint256 _amount,
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

        emit Burned(_sender, _amount);
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
        if (_transactionType == TransactionSend.MINT) {
            (address _user, uint256 _amount) = abi.decode(_data, (address, uint256));
            _mint(_user, _amount);
        }
    }

    function getMinted(address _user) public view returns (uint256) {
        return minted[_user];
    }

    function getFeePay(address _user) public view returns (uint256) {
        return feePay[_user];
    }

    function getDsc() public view returns (DSC) {
        return dsc;
    }

    function getMainRouter() public view returns (address) {
        return mainRouter;
    }

    function getMainRouterChainSelector() public view returns (uint64) {
        return mainRouterChainSelector;
    }
}