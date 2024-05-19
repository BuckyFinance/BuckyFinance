// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { IERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

contract Depositor is CCIPReceiver {
    using SafeERC20 for IERC20;

    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);

    enum TransactionReceive {
        DEPOSIT,
        BURN
    }

    enum TransactionSend {
        REDEEM,
        MINT
    }
    
    mapping (address => mapping(address => uint256)) public deposited;
    mapping (address => uint256) public feePay;

    address public immutable mainRouter;
    uint64 public immutable mainRouterChainSelector;

    constructor(address _router, uint64 _mainRouterChainSelector, address _mainRouter) CCIPReceiver(_router) {
        mainRouter = _mainRouter;
        mainRouterChainSelector = _mainRouterChainSelector;
    }

    function deposit(address _token, uint256 _amount) external payable {
        feePay[msg.sender] += msg.value;
        _deposit(msg.sender, _token, _amount);
        bytes memory _data = abi.encode(TransactionReceive.DEPOSIT, abi.encode(msg.sender, _token, _amount));
        _ccipSendToMainRouter(msg.sender, _data);
    }

    function _deposit(address _sender, address _token, uint256 _amount) internal {
        IERC20(_token).safeTransferFrom(_sender, address(this), _amount);
        deposited[_sender][_token] += _amount;
    }

    function _redeem(address _receiver, address _token, uint256 _amount) internal {
        deposited[_receiver][_token] -= _amount;
        IERC20(_token).safeTransfer(_receiver, _amount);
    }


    // CCIP

    function _ccipSendToMainRouter(
        address _sender,
        bytes memory _data
    ) internal returns (bytes32 _messageId) {
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

    receive() external payable {
        feePay[msg.sender] += msg.value;
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        (TransactionSend _transactionType, bytes memory _data) = abi.decode(message.data, (TransactionSend, bytes));
        if (_transactionType == TransactionSend.REDEEM) {
            (address _user, address _token, uint256 _amount) = abi.decode(_data, (address, address, uint256));
            _redeem(_user, _token, _amount);
        }
    }

    /// @notice Construct a CCIP message.
    /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for sending a text.
    /// @param _receiver The address of the receiver.
    /// @param _data Data to be sent
    /// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
    /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
    function _buildCCIPMessage(
        address _receiver,
        bytes memory _data,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI-encoded receiver address
                data: _data, // ABI-encoded string
                tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array aas no tokens are transferred
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit
                    Client.EVMExtraArgsV1({gasLimit: 200_000})
                ),
                // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
                feeToken: _feeTokenAddress
            });
    }
}