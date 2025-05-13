// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ILotteryGame {
    function drawWinners(
        uint256 lotteryId,
        uint256 numberOfWinners
    ) external payable;
}
