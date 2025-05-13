// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ILotteryGame} from "./interfaces/ILotteryGame.sol";
import {ILotteryManager} from "./interfaces/ILotteryManager.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

error NoLotteryOwner(string reason);
error OnlyGame(string reason);
error SimpleError(string reason);

contract LotteryManager is Ownable, ILotteryManager {
    ILotteryGame public game;
    uint256 private _totalLotteries;
    uint256 private constant MAX_WINNERS = 50;
    uint256 public platformBalance;

    // mappings
    mapping(uint256 => LotteryStruct) private lotteries;
    mapping(uint256 => ParticipationStruct[]) private lotteryParticipants;
    mapping(uint256 => LuckyNumber[]) private lotteryLuckyNumbers;

    // events (define log schema)
    event LotteryCreated(uint256 indexed id, address indexed owner);
    event TicketBought(uint256 indexed id, address indexed owner);
    event LuckyNumbersImported(uint256 indexed id, uint256 count);

    // using this makes sure that the function is only executable by the owner of the lottery.
    modifier onlyLotteryOwner(uint256 id) {
        if (lotteries[id].owner != msg.sender) {
            revert NoLotteryOwner("Only callable by owner!");
        }
        _;
    }

    modifier onlyGame() {
        if (address(game) != msg.sender) {
            revert OnlyGame("Only callable by lottery game!");
        }
        _;
    }
    constructor() Ownable(msg.sender) {}

    function setGame(address _game) public onlyOwner {
        game = ILotteryGame(_game);
    }

    // everyone can create a Lottery
    function createLottery(
        string memory title,
        string memory description,
        string memory imageURL,
        uint256 ticketPrice,
        uint256 servicePercent,
        uint256 expiresAt
    ) external {
        // sanity checks
        if (bytes(title).length == 0)
            revert SimpleError("Title cannot be empty");
        if (ticketPrice == 0)
            revert SimpleError("Ticket Prize must be positive");
        if (expiresAt <= block.timestamp)
            revert SimpleError("Expiration must be in future");

        uint256 lotteryId = _totalLotteries;
        _totalLotteries += 1;

        // create new lottery
        LotteryStruct memory newLottery = LotteryStruct({
            id: lotteryId,
            title: title,
            imageURL: imageURL,
            description: description,
            ticketPrice: ticketPrice,
            servicePercent: servicePercent,
            numOfParticipants: 0,
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
    function importLuckyNumbers(
        uint256 lotteryId,
        string[] memory luckyNumbers
    ) external onlyLotteryOwner(lotteryId) {
        if (lotteryLuckyNumbers[lotteryId].length != 0)
            revert SimpleError("Already imported");
        if (lotteries[lotteryId].numOfParticipants != 0)
            revert SimpleError("Participants already joined");
        if (luckyNumbers.length == 0) revert SimpleError("Empty list");

        for (uint256 i = 0; i < luckyNumbers.length; i++) {
            lotteryLuckyNumbers[lotteryId].push(
                LuckyNumber({number: luckyNumbers[i], isUsed: false})
            );
        }
        emit LuckyNumbersImported(lotteryId, luckyNumbers.length);
    }

    // function callable by anyone
    function buyTicket(
        uint256 lotteryId,
        uint256 luckyNumberIndex
    ) external payable {
        // reference lottery on chain
        LotteryStruct storage lottery = lotteries[lotteryId];
        if (msg.value < lottery.ticketPrice)
            revert SimpleError("Insufficient ETH");
        if (block.timestamp > lottery.expiresAt)
            revert SimpleError("Cannot buy Tickets anymore.");
        if (lottery.drawn) revert SimpleError("Lottery already drawn!");

        LuckyNumber storage luckyNumber = lotteryLuckyNumbers[lotteryId][
            luckyNumberIndex
        ];
        // use index, because it is more gas friendly than string comparison using hashing
        if (luckyNumber.isUsed) revert SimpleError("Number already used!");

        lotteryParticipants[lotteryId].push(
            ParticipationStruct({
                account: msg.sender,
                lotteryNumber: luckyNumber.number
            })
        );

        lottery.numOfParticipants++;
        luckyNumber.isUsed = true;

        emit TicketBought(lotteryId, msg.sender);
    }

    // draw winners
    function drawWinners(
        uint256 lotteryId,
        uint256 numberOfWinners
    ) external onlyLotteryOwner(lotteryId) {
        ILotteryManager.LotteryStruct storage lottery = lotteries[lotteryId];
        if (lottery.drawn) revert SimpleError("Lottery already drawn");
        //        if(block.timestamp < lottery.expiresAt) revert SimpleError ("Lottery not expired yet");
        if (numberOfWinners < 1)
            revert SimpleError("Must have at least one winner");
        if (
            numberOfWinners > lottery.numOfParticipants ||
            numberOfWinners > MAX_WINNERS
        ) revert SimpleError("Too many winners");

        // forward to game
        uint256 jackpot = lottery.ticketPrice * lottery.numOfParticipants;
        lottery.drawn = true;
        game.drawWinners{value: jackpot}(lotteryId, numberOfWinners);
    }

    function getAvailableLuckyNumbers(
        uint256 lotteryId
    ) external view returns (string[] memory available) {
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

    function getLottery(
        uint256 lotteryId
    ) external view returns (LotteryStruct memory) {
        return lotteries[lotteryId];
    }

    function getLotteries()
        external
        view
        returns (LotteryStruct[] memory _lotteries)
    {
        _lotteries = new LotteryStruct[](_totalLotteries);
        for (uint256 i = 0; i < _totalLotteries; i++) {
            _lotteries[i] = _lotteries[i];
        }
    }

    // getter for the lottery numOfParticipant
    function getLotteryParticipantsAddresses(
        uint256 lotteryId
    ) external view returns (address[] memory) {
        address[] memory _participations = new address[](
            lotteryParticipants[lotteryId].length
        );
        for (uint256 i = 0; i < lotteryParticipants[lotteryId].length; ++i) {
            _participations[i] = lotteryParticipants[lotteryId][i].account;
        }
        return _participations;
    }

    function getLotteryParticipants(
        uint256 lotteryId
    ) external view returns (ParticipationStruct[] memory) {
        ParticipationStruct[]
            memory _participations = new ParticipationStruct[](
                lotteryParticipants[lotteryId].length
            );
        for (uint256 i = 0; i < lotteryParticipants[lotteryId].length; ++i) {
            _participations[i] = lotteryParticipants[lotteryId][i];
        }
        return _participations;
    }

    function getJackpot(uint256 lotteryId) external view returns (uint256) {
        LotteryStruct storage lottery = lotteries[lotteryId];
        return lottery.ticketPrice * lottery.numOfParticipants;
    }

    function getLuckyNumbers(
        uint256 lotteryId
    ) external view returns (string[] memory luckyNumbers) {
        luckyNumbers = new string[](lotteryLuckyNumbers[lotteryId].length);
        for (uint256 i = 0; i < lotteryLuckyNumbers[lotteryId].length; ++i) {
            luckyNumbers[i] = lotteryLuckyNumbers[lotteryId][i].number;
        }
        return luckyNumbers;
    }

    function getTotalLotteries() external view returns (uint256) {
        return _totalLotteries;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
