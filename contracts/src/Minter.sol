// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import { DSC } from "./DSC.sol";
import { CCIPBase } from "./library/CCIPBase.sol";
import { IMainRouter } from "./interface/IMainRouter.sol";


contract Minter is CCIPBase {
    using SafeERC20 for IERC20;

    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);
    error NotAllowed();

    event Minted(address indexed user, uint256 indexed amount);
    event Burned(address indexed user, uint256 indexed amount);

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

    mapping (address => uint256) private minted;
    mapping (address => uint256) private feePay;


    DSC private immutable dsc;

    address private mainRouter;
    uint64 private mainRouterChainSelector;

    uint256 private ccipBurnGasLimit = 500_000;
    uint256 private ccipBurnAndMintGasLimit = 1_000_000;

    constructor(uint64 _chainSelector, address _router, uint64 _mainRouterChainSelector, address _mainRouter) CCIPBase(_chainSelector, _router) {
        mainRouter = _mainRouter;
        mainRouterChainSelector = _mainRouterChainSelector;
        dsc = new DSC();
    }

    

    receive() external payable {
        feePay[msg.sender] += msg.value;
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

    function setCCIPBurnGasLimit(uint256 _newGasLimit) external onlyOwner {
        ccipBurnGasLimit = _newGasLimit;
    }

    function setCCIPBurnAndMintGasLimit(uint256 _newGasLimit) external onlyOwner {
        ccipBurnAndMintGasLimit = _newGasLimit;
    }

    function withdrawFeePay(uint256 _amount) external {
        require(_amount <= feePay[msg.sender], "Not enough fee pay");
        feePay[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
    } 

    function burn(uint256 _amount) external payable {
        feePay[msg.sender] += msg.value;
        minted[msg.sender] -= _amount;
        IERC20(address(dsc)).safeTransferFrom(msg.sender, address(this), _amount);
        dsc.burn(_amount);

        if (chainSelector == mainRouterChainSelector) {
            IMainRouter(mainRouter).burn(msg.sender, chainSelector, _amount);
            return;
        }

        bytes memory _data = abi.encode(TransactionReceive.BURN, abi.encode(msg.sender, _amount));
        _ccipSend(msg.sender, _amount, _data, ccipBurnGasLimit);
    }

    function burnAndMint(uint256 _amount, uint64 _destinationChainSelector, address _receiver) external payable {
        feePay[msg.sender] += msg.value;
        minted[msg.sender] -= _amount;
        IERC20(address(dsc)).safeTransferFrom(msg.sender, address(this), _amount);
        dsc.burn(_amount);

        if (chainSelector == mainRouterChainSelector) {
            IMainRouter(mainRouter).burnAndMint(msg.sender, chainSelector, _amount, _destinationChainSelector, _receiver);
            return;
        }

        bytes memory _data = abi.encode(TransactionReceive.BURN_MINT, abi.encode(msg.sender, _amount, _destinationChainSelector, _receiver));
        _ccipSend(msg.sender, _amount, _data, ccipBurnAndMintGasLimit);
    }

    function mint(address _receiver, uint256 _amount) external onlyMainRouter(msg.sender) {
        _mint(_receiver, _amount);
    }

    function liquidate(
        address _liquidatedUser, 
        address _token, 
        uint64 _destinationChainSelector, 
        address _receiver, 
        uint256 _amountToCover,
        uint256 _gasLimit
    )   external payable {
        feePay[msg.sender] += msg.value;
        IERC20(address(dsc)).safeTransferFrom(msg.sender, address(this), _amountToCover);
        dsc.burn(_amountToCover);

        if (chainSelector == mainRouterChainSelector) {
            IMainRouter(mainRouter).liquidate(chainSelector, _liquidatedUser, _token, _destinationChainSelector, _receiver, _amountToCover, msg.sender);
            return;
        }

        bytes memory _data = abi.encode(TransactionReceive.LIQUIDATE, abi.encode(
            _liquidatedUser, 
            _token, 
            _destinationChainSelector, 
            _receiver,  
            _amountToCover,
            msg.sender
        ));
        _ccipSend(msg.sender, _amountToCover, _data, _gasLimit);
    }

    function _mint(address _receiver, uint256 _amount) internal {
        minted[_receiver] += _amount;
        dsc.mint(_receiver, _amount);
        emit Minted(_receiver, _amount);
    }

    function _ccipSend(
        address _sender,
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

    function getBurnFee(uint256 _amount) public view returns(uint256){
        if (chainSelector == mainRouterChainSelector){
            return 0;
        }
        bytes memory _data = abi.encode(TransactionReceive.BURN, abi.encode(msg.sender, _amount));
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            mainRouter, 
            _data,
            address(0),
            ccipBurnGasLimit
        );

        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(mainRouterChainSelector, _message);

        return _fees;
    }

    function getBurnAndMintFee(uint256 _amount, uint64 _destinationChainSelector, address _receiver) public view returns(uint256) {
        if (chainSelector == mainRouterChainSelector){
            return 0;
        }
        bytes memory _data = abi.encode(TransactionReceive.BURN_MINT, abi.encode(msg.sender, _amount, _destinationChainSelector, _receiver));
        Client.EVM2AnyMessage memory _message = _buildCCIPMessage(
            mainRouter, 
            _data,
            address(0),
            ccipBurnAndMintGasLimit
        );

        IRouterClient _router = IRouterClient(getRouter());
        uint256 _fees = _router.getFee(mainRouterChainSelector, _message);
        return _fees;
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