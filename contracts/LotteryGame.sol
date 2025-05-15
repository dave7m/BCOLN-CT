// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

import {ILotteryManager} from "./interfaces/ILotteryManager.sol";
import {ILotteryGame} from "./interfaces/ILotteryGame.sol";

error OnlyManager(string reason);
error NoFunds();

contract LotteryGame is
    ILotteryGame,
    VRFConsumerBaseV2,
    Ownable,
    ReentrancyGuard
{
    ILotteryManager public manager;

    modifier onlyManager() {
        if (address(manager) != msg.sender) {
            revert OnlyManager("Only callable by lottery manager!");
        }
        _;
    }

    // VRF fields
    VRFCoordinatorV2Interface private immutable COORDINATOR;
    uint256 private immutable SUBSCRIPTION_ID;
    bytes32 private immutable KEY_HASH;
    uint32 private immutable CALLBACK_GAS_LIMIT = 100000;
    uint16 private immutable REQUEST_CONFIRMATIONS = 3;
    // VRF does not guarantee unique words, therefore, we fetch one random word which is then used deterministically
    // for determining the winners.
    uint32 private immutable NUM_WORDS = 1;

    mapping(uint256 => uint256) public requestIdToLotteryId;
    mapping(uint256 => uint256) public requestIdToNumberOfWinners;
    mapping(uint256 => uint256) public requestIdToLotteryPrizePool;

    mapping(address => uint256) public pendingWithdrawals;
    event WinnersDrawn(
        uint256 indexed lotteryId,
        ILotteryManager.ParticipationStruct[] winners,
        uint256 prizePerWinner,
        uint256 seed
    );
    event Deposit(address indexed to, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);

    struct LotteryResult {
        bool completed;
        uint256 timestamp;
        ILotteryManager.ParticipationStruct[] winners;
        uint256 prizePerWinner;
        uint256 seed;
    }

    mapping(uint256 => LotteryResult) public lotteryResults;

    constructor(
        address vrfCoordinator,
        bytes32 _keyHash,
        uint256 subscriptionId,
        address managerAddress
    ) VRFConsumerBaseV2(vrfCoordinator) Ownable(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        KEY_HASH = _keyHash;
        SUBSCRIPTION_ID = subscriptionId;
        manager = ILotteryManager(managerAddress);
    }

    // only callable by the LotteryManager contract
    function drawWinners(
        uint256 lotteryId,
        uint256 numberOfWinners
    ) external payable onlyManager {
        // request random number
        uint256 requestId = COORDINATOR.requestRandomWords(
            KEY_HASH,
            uint64(SUBSCRIPTION_ID),
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );

        // save lotteryId under that request
        requestIdToLotteryId[requestId] = lotteryId;
        requestIdToNumberOfWinners[requestId] = numberOfWinners;
        requestIdToLotteryPrizePool[requestId] = msg.value;
    }

    // callback called by vrf
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 lotteryId = requestIdToLotteryId[requestId];
        uint256 numberOfWinners = requestIdToNumberOfWinners[requestId];

        ILotteryManager.LotteryStruct memory lottery = manager.getLottery(
            lotteryId
        );
        ILotteryManager.ParticipationStruct[] memory participants = manager
            .getLotteryParticipants(lotteryId);

        // select winners
        ILotteryManager.ParticipationStruct[] memory winners = _selectWinners(
            participants,
            numberOfWinners,
            randomWords[0]
        );

        // calculate prizes
        uint256 totalPrize = requestIdToLotteryPrizePool[requestId];
        uint256 platformFee = (totalPrize * lottery.servicePercent) / 100;
        uint256 prizePerWinner = (totalPrize - platformFee) / numberOfWinners;

        // 4) **deposit** into each recipient’s withdrawal balance
        for (uint256 i = 0; i < winners.length; i++) {
            pendingWithdrawals[winners[i].account] += prizePerWinner;
            emit Deposit(winners[i].account, prizePerWinner);
        }
        // deposit the owner fee
        pendingWithdrawals[lottery.owner] += platformFee;
        emit Deposit(lottery.owner, platformFee);

        emit WinnersDrawn(lotteryId, winners, prizePerWinner, randomWords[0]);

        LotteryResult storage result = lotteryResults[lotteryId];
        result.completed = true;
        result.timestamp = block.timestamp;
        result.prizePerWinner = prizePerWinner;
        result.seed = randomWords[0];

        for (uint256 i = 0; i < winners.length; i++) {
            result.winners.push(winners[i]);
        }

        // cleanup
        delete requestIdToLotteryId[requestId];
        delete requestIdToNumberOfWinners[requestId];
        delete requestIdToLotteryPrizePool[requestId];
    }

    function _selectWinners(
        ILotteryManager.ParticipationStruct[] memory participants,
        uint256 _numberOfWinners,
        uint256 seed
    ) private pure returns (ILotteryManager.ParticipationStruct[] memory) {
        ILotteryManager.ParticipationStruct[]
            memory selected = new ILotteryManager.ParticipationStruct[](
                _numberOfWinners
            );
        uint256[] memory indices = _fisherYates(participants.length, seed);

        for (uint256 i = 0; i < _numberOfWinners; i++) {
            selected[i] = participants[indices[i]];
        }

        return selected;
    }

    // shuffle
    function _fisherYates(
        uint256 n,
        uint256 seed
    ) private pure returns (uint256[] memory) {
        uint256[] memory indices = new uint256[](n);
        for (uint256 i = 0; i < n; i++) indices[i] = i;

        for (uint256 i = n - 1; i > 0; i--) {
            // select
            uint256 j = uint256(keccak256(abi.encodePacked(seed, i))) % (i + 1);
            // swap
            (indices[i], indices[j]) = (indices[j], indices[i]);
        }

        return indices;
    }

    // recipients (winners & owner) call this to pull their ETH
    function withdrawPayments() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NoFunds();
        pendingWithdrawals[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert NoFunds();
        emit Withdrawn(msg.sender, amount);
    }

    function getLotteryResults(
        uint256 lotteryId
    ) external view returns (LotteryResult memory) {
        return lotteryResults[lotteryId];
    }

    receive() external payable {}
}
