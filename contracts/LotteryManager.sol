// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

error NoLotteryOwner(string reason);
error SimpleError(string reason);

interface ILotteryManager {
    struct LotteryStruct {
        uint256 id;
        string title;
        string description;
        uint256 ticketPrice;
        uint256 participants;
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
        uint256 prize,
        uint256 ticketPrice,
        uint256 expiresAt
    ) external;

    function importLuckyNumbers(uint256 id, string[] memory luckyNumbers) external;
    function buyTicket(uint256 id, uint256 luckyNumberIndex) external payable;
    function getAvailableLuckyNumbers(uint256 lotteryId) external view returns (string[] memory available);
    function getParticipants(uint256 id) external view returns (ParticipationStruct[] memory);
    function getPrize(uint256 lotteryId) external view returns (uint256);
}


contract LotteryManager is Ownable, ILotteryManager {
    uint256 private _totalLotteries;

    // mappings
    mapping(uint256 => LotteryStruct) private lotteries;
    mapping(uint256 => ParticipationStruct[]) private lotteryParticipants;
    mapping(uint256 => LuckyNumber[])  private lotteryLuckyNumbers;

    // events (define log schema)
    event LotteryCreated(uint256 indexed id, address indexed owner);
    event TicketBought(uint256 indexed id, address indexed owner);
    event LuckyNumbersImported(uint256 indexed id, uint256 count);


    // using this makes sure that the function is only executable by the owner of the lottery.
    modifier onlyLotteryOwner(uint256 id) {
        if(lotteries[id].owner != msg.sender) {
            revert NoLotteryOwner("Only callable by owner!");
        }
        _;
    }

    constructor() Ownable(msg.sender){}

    function createLottery(
        string memory title,
        string memory description,
        uint256 ticketPrice,
        uint256 servicePercent,
        uint256 expiresAt
    ) external {
        // sanity checks
        if(bytes(title).length == 0) revert SimpleError("Title cannot be empty");
        if(ticketPrice == 0) revert SimpleError("Ticket Prize must be positive");
        if(expiresAt <= block.timestamp) revert SimpleError("Expiration must be in future");

        _totalLotteries += 1;
        uint256 lotteryId = _totalLotteries;

        // create new lottery
        LotteryStruct memory newLottery = LotteryStruct({
            id: lotteryId,
            title: title,
            description: description,
            ticketPrice: ticketPrice,
            servicePercent: servicePercent,
            participants: 0,
            drawn: false,
            owner: msg.sender,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });

        // add lottery
        lotteries[lotteryId] = newLottery;
        // Fire event
        emit LotteryCreated(lotteryId, msg.sender);

    }

    // owner uploads n lucky numbers
    function importLuckyNumbers(uint256 lotteryId, string[] memory luckyNumbers) external onlyLotteryOwner(lotteryId) {
        if (lotteryLuckyNumbers[lotteryId].length != 0) revert SimpleError("Already imported");
        if(lotteries[lotteryId].participants != 0) revert SimpleError("Participants already joined");
        if(luckyNumbers.length == 0) revert SimpleError("Empty list");

        for (uint256 i = 0; i < luckyNumbers.length; i++) {
            lotteryLuckyNumbers[lotteryId].push(LuckyNumber({
                number: luckyNumbers[i],
                isUsed: false
            }));
        }
        emit LuckyNumbersImported(lotteryId, luckyNumbers.length);
    }

    // function callable by anyone, where
    function buyTicket(uint256 lotteryId, uint256 luckyNumberIndex) external payable {
        // reference lottery on chain
        LotteryStruct storage lottery = lotteries[lotteryId];
        if(msg.value < lottery.ticketPrice) revert SimpleError("Insufficient ETH");

        LuckyNumber storage luckyNumber = lotteryLuckyNumbers[lotteryId][luckyNumberIndex];
        // use index, because it is more gas friendly than string comparison using hashing
        if(luckyNumber.isUsed) revert SimpleError("Number already used!");

        lotteryParticipants[lotteryId].push(
            ParticipationStruct({
                account: msg.sender,
                lotteryNumber: luckyNumber.number
            })
        );

        lottery.participants++;
        luckyNumber.isUsed = true;

        emit TicketBought(lotteryId, msg.sender);
    }

    function getAvailableLuckyNumbers(uint256 lotteryId) external view returns (string[] memory available) {
        LuckyNumber[] storage all = lotteryLuckyNumbers[lotteryId];

        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!all[i].isUsed) {
                count++;
            }
        }

        available = new string[](count);

        uint256 j = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!all[i].isUsed) {
                available[j] = all[i].number;
                j++;
            }
        }

        return available;
    }

    function getLottery(uint256 lotteryId) external view returns (LotteryStruct memory) {
        return lotteries[lotteryId];
    }

    // getter for the lottery participants
    function getParticipants(uint256 lotteryId) external view returns (ParticipationStruct[] memory) {
        return lotteryParticipants[lotteryId];
    }

    function getPrize(uint256 lotteryId) external view returns (uint256) {
        LotteryStruct storage lottery = lotteries[lotteryId];
        return lottery.ticketPrice * lottery.participants;
    }

}