// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { VRFCoordinatorV2Interface } from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

contract VRFCoordinatorV2Mock is VRFCoordinatorV2Interface {
  uint256 private nextRequestId = 1;
  function requestRandomWords(
    bytes32 ,
    uint64 ,
    uint16 ,
    uint32 ,
    uint32
  ) external override returns (uint256 requestId) {
    requestId = nextRequestId++;
  }

  // helper for tests
  function callBackWithRandomness(
    uint256 requestId,
    uint256[] memory randomWords,
    address consumer
  ) external {
    (
      bool success,
    ) = consumer.call(
      abi.encodeWithSignature("rawFulfillRandomWords(uint256,uint256[])", requestId, randomWords)
    );
    require(success);
  }

  // pseudo-implement interface
  function getRequestConfig() external pure returns (uint16, uint32, bytes32[] memory) { revert("Not Implemented" );}
  function createSubscription() external pure returns (uint64) { revert("Not Implemented" );}
  function getSubscription(
    uint64
  ) external  pure returns (uint96, uint64, address, address[] memory) { revert("Not Implemented" );}
  function requestSubscriptionOwnerTransfer(uint64, address) external pure { revert("Not Implemented" );}
  function acceptSubscriptionOwnerTransfer(uint64) external pure { revert("Not Implemented" );}
  function addConsumer(uint64, address) external  pure{ revert("Not Implemented" );}
  function removeConsumer(uint64, address) external pure { revert("Not Implemented" );}
  function cancelSubscription(uint64, address) external pure { revert("Not Implemented" );}
  function pendingRequestExists(uint64) external  pure returns (bool) { revert("Not Implemented" );}


}
