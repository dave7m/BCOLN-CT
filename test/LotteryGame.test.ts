import { expect } from "chai";
import { ethers } from "hardhat";
import type {
  LotteryGame,
  LotteryManager,
  VRFCoordinatorV2Mock,
} from "@/typechain-types";

let snapshotId: string;

describe("LotteryGame", function () {
  let manager: LotteryManager;
  let game: LotteryGame;
  let vrfMock: VRFCoordinatorV2Mock;
  let owner: any, user1: any, user2: any;

  const ticketPrice = ethers.parseEther("0.01");
  const servicePercent = 10;
  const expiresInOneHour = Math.floor(Date.now() / 1000) + 3600;

  beforeEach(async () => {
    // test accounts
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy VRF Mock
    const VRFMock = await ethers.getContractFactory(
      "VRFCoordinatorV2Mock",
      owner,
    );
    vrfMock = await VRFMock.deploy();
    await vrfMock.waitForDeployment();

    // Deploy Manager
    const Manager = await ethers.getContractFactory("LotteryManager", owner);
    manager = await Manager.deploy();
    await manager.waitForDeployment();

    // Deploy Game with VRF Coordinator
    const Game = await ethers.getContractFactory("LotteryGame", owner);
    game = await Game.deploy(
      await vrfMock.getAddress(),
      ethers.ZeroHash,
      1,
      await manager.getAddress(),
    );
    await game.waitForDeployment();

    // Connect manager to game
    await manager.setGame(await game.getAddress());

    // Create a lottery
    await manager.createLottery(
      "L",
      "Desc",
      "image.url",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );

    // Import lucky numbers
    await manager.importLuckyNumbers(0, ["A", "B", "C"]);

    // Buy tickets
    await manager.connect(user1).buyTicket(0, 0, { value: ticketPrice });
    await manager.connect(user2).buyTicket(0, 1, { value: ticketPrice });

    // Handle expiry dates
    snapshotId = await ethers.provider.send("evm_snapshot", []);
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);
  });

  afterEach(async () => {
    await ethers.provider.send("evm_revert", [snapshotId]);
  });

  it("should call drawWinners and trigger VRF request", async () => {
    await expect(manager.connect(owner).drawWinners(0, 2)).to.not.be.reverted;
  });

  it("should handle fulfillRandomWords and distribute winnings", async () => {
    await manager.drawWinners(0, 2);

    const requestId = 1;
    const randomSeed = 123;

    // Call VRF callback
    await expect(
      vrfMock.callBackWithRandomness(
        requestId,
        [randomSeed],
        await game.getAddress(),
      ),
    ).to.not.be.reverted;

    // Check withdrawals were recorded
    const balance1 = await game.pendingWithdrawals(await user1.getAddress());
    const balance2 = await game.pendingWithdrawals(await user2.getAddress());
    expect(balance1 > 0n || balance2 > 0n).to.be.true;

    const ownerBalance = await game.pendingWithdrawals(
      await owner.getAddress(),
    );
    expect(ownerBalance).to.be.gt(0);
  });

  it("should allow withdrawal by winners and owner", async () => {
    await manager.drawWinners(0, 2);

    await vrfMock.callBackWithRandomness(1, [42], await game.getAddress());

    const user1Address = await user1.getAddress();
    const payout = await game.pendingWithdrawals(user1Address);
    const before = await ethers.provider.getBalance(user1Address);

    const tx = await game.connect(user1).withdrawPayments();
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;

    // @ts-ignore
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const after = await ethers.provider.getBalance(user1Address);
    const delta = 10n ** 14n;
    const expected = before + payout;

    expect(after + gasUsed).to.be.gte(expected - delta);
    expect(after + gasUsed).to.be.lte(expected + delta);
  });

  it("should revert withdrawPayments if no funds", async () => {
    await expect(
      game.connect(user1).withdrawPayments(),
    ).to.be.revertedWithCustomError(game, "NoFunds");
  });

  it("should revert withdrawPayments if transfer fails", async () => {
    // user 1 winning
    await manager.drawWinners(0, 1);
    await vrfMock.callBackWithRandomness(1, [42], await game.getAddress());

    // 0 check manipualtion
    await ethers.provider.send("hardhat_setBalance", [
      await game.getAddress(),
      "0x0",
    ]);

    // revert verification
    await expect(
      game.connect(user1).withdrawPayments(),
    ).to.be.revertedWithCustomError(game, "NoFunds");
  });
});
