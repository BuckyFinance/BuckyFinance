// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { CCIPReceiver } from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import { Client } from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @author Duc Anh Le

abstract contract CCIPBase is CCIPReceiver, Ownable {
    using EnumerableSet for EnumerableSet.UintSet;

    error DestinationChainNotAllowlisted(uint64 destinationChainSelector);
    error SourceChainNotAllowlisted(uint64 sourceChainSelector);
    error SenderNotAllowlisted(address sender);
    error InvalidReceiverAddress();

    constructor(address _router) CCIPReceiver(_router) Ownable(msg.sender) {}

    EnumerableSet.UintSet internal allowedChains;

    mapping (uint64 => bool) allowListedDestinationChains;
    mapping (uint64 => bool) public allowListedSourceChains;
    mapping (address => bool) public allowListedSenders;

    modifier onlyAllowListedDestinationChain(uint64 _destinationChainSelector) {
        if (!allowListedDestinationChains[_destinationChainSelector])
            revert DestinationChainNotAllowlisted(_destinationChainSelector);
        _;
    }

    modifier onlyAllowListed(uint64 _sourceChainSelector, address _sender) {
        if (!allowListedSourceChains[_sourceChainSelector])
            revert SourceChainNotAllowlisted(_sourceChainSelector);
        if (!allowListedSenders[_sender]) revert SenderNotAllowlisted(_sender);
        _;
    }

    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }
    function setAllowedDestinationChain(
        uint64 _destinationChainSelector,
        bool _allowed
    ) external onlyOwner {
        allowListedDestinationChains[_destinationChainSelector] = _allowed;
        if (_allowed){
            allowedChains.add(_destinationChainSelector);
        } else {
            allowedChains.remove(_destinationChainSelector);
        }
    }

    function setAllowedSourceChain(
        uint64 _sourceChainSelector,
        bool allowed
    ) external onlyOwner {

        allowListedSourceChains[_sourceChainSelector] = allowed;
    }

    function setAllowedSender(address _sender, bool allowed) external onlyOwner {
        allowListedSenders[_sender] = allowed;
    }

    function _buildCCIPMessage(
        address _receiver,
        bytes memory _data,
        address _feeTokenAddress
    ) internal pure returns (Client.EVM2AnyMessage memory) {
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver),
                data: _data,
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 200_000})
                ),
                feeToken: _feeTokenAddress
            });
    }
}