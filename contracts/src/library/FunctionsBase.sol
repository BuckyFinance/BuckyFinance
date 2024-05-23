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

    address public functionsRouter;
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit;

    mapping (bytes32 => address) requestIdToUser;

    string source = 
        "const user = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://beta.credprotocol.com/api/score/address/${user}/`,"
        "headers: {'Authorization': `Token 373540836d1296f8c4f792eade78ddd89ab13d20`},"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { data } = apiResponse;"
        "return Functions.encodeUint256(data.value);";

    constructor(address _functionRouter, bytes32 _donId) FunctionsClient(_functionRouter) {
        functionsRouter = _functionRouter;
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
}