// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { FunctionsClient } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { FunctionsRequest } from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

abstract contract FunctionsBase is FunctionsClient, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;

    error UnexpectedRequestID(address user, bytes32 requestId);

    event Response(
        address indexed user,
        bytes32 indexed requestId,
        uint16 indexed credit,
        bytes response,
        bytes err
    );

    address internal functionsRouter;
    bytes32 internal donId;
    uint64 internal subscriptionId;
    uint32 internal gasLimit = 300_000;

    mapping (bytes32 => address) internal requestIdToUser;

    string source;

    constructor(address _functionRouter, bytes32 _donId) FunctionsClient(_functionRouter) {
        functionsRouter = _functionRouter;
        donId = _donId;
    }

    function setFunctionsRouter(address _functionsRouter) external onlyOwner {
        functionsRouter = _functionsRouter;
    }

    function setDonId(bytes32 _donId) external onlyOwner {
        donId = _donId;
    }

    function setSubscriptionID(uint64 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
    }

    function setGasLimit(uint32 _gasLimit) external onlyOwner {
        gasLimit = _gasLimit;
    }

    function setSource(string memory _source) external onlyOwner {
        source = _source;
    }

    function getFunctionsRouter() public view returns (address) {
        return functionsRouter;
    }

    function getDonId() public view returns (bytes32) {
        return donId;
    }

    function getSubscriptionId() public view returns (uint64) {
        return subscriptionId;
    }

    function getGasLimit() public view returns (uint32) {
        return gasLimit;
    }

    function getSource() public view returns (string memory) {
        return source;
    }

    function getRequestIdToUser(bytes32 _requestId) public view returns (address) {
        return requestIdToUser[_requestId];
    }
}