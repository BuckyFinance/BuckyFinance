// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract MainRouter is CCIPReceiver {
    error NotEnoughFeePay(uint256 userFeePay, uint256 fees);
    error HealthFactorTooLow();
    error AmountHasToBeGreaterThanZero();

    enum TransactionReceive {
        DEPOSIT,
        BURN
    }

    enum TransactionSend {
        REDEEM,
        MINT
    }
    // User => Chain Selector => Token => Amount
    mapping (address => mapping(uint64 => mapping(address => uint256))) public deposited;
    
    // User => Chain selector => Amount minted
    mapping (address => mapping(uint64 => uint256)) public minted;

    mapping (address => uint256) public feePay;

    constructor (address _router) CCIPReceiver(_router) {}

    function redeem(uint64 _destinationChainSelector, address _receiver, address _token, uint256 _amount) external payable {
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

    function mint(uint64 _destinationChainSelector, address _receiver, uint256 _amount) external payable {
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

    function _ccipSend(
        uint64 _destinationChainSelector,
        address _receiver,
        bytes memory _data
    ) internal returns (bytes32 _messageId) {
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

    receive() external payable {
        feePay[msg.sender] += msg.value;
    }

    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
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

    function _checkHealthFactor(address _user) public view returns(bool) {
        return true;
    }

    function getUserInformation(address _user, uint64 _chainSelector, address _token) external view returns (uint256) {
        return deposited[_user][_chainSelector][_token];
    }
    
}