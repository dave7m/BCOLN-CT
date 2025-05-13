// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ILotteryManager {
    struct LotteryStruct {
        uint256 id;
        string title;
        string description;
        string imageURL;
        uint256 ticketPrice;
        uint256 numOfParticipants;
        uint256 servicePercent;
        bool drawn;
        address owner;
        uint256 createdAt;
        uint256 expiresAt;
    }
    struct ParticipationStruct {
        address account;
        string lotteryNumber;
    }
    struct LuckyNumber {
        string number;
        bool isUsed;
    }

    function createLottery(
        string memory title,
        string memory description,
        string memory imageURL,
        uint256 prize,
        uint256 ticketPrice,
        uint256 expiresAt
    ) external;

    function importLuckyNumbers(
        uint256 id,
        string[] memory luckyNumbers
    ) external;
    function buyTicket(uint256 id, uint256 luckyNumberIndex) external payable;
    function getAvailableLuckyNumbers(
        uint256 lotteryId
    ) external view returns (string[] memory available);
    function getLotteryParticipantsAddresses(
        uint256 id
    ) external view returns (address[] memory);
    function getLotteryParticipants(
        uint256 id
    ) external view returns (ParticipationStruct[] memory);
    function getJackpot(uint256 lotteryId) external view returns (uint256);
    function getLottery(
        uint256 lotteryId
    ) external view returns (LotteryStruct memory);
    function getLotteries() external view returns (LotteryStruct[] memory);
}
