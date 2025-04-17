import { expect } from "chai";
import { ethers } from "hardhat";
import type {
  LotteryGame,
  LotteryManager,
  VRFCoordinatorV2Mock,
} from "../typechain-types";

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
    [owner, user1, user2] = await ethers.getSigners();

    const VRFMock = await ethers.getContractFactory(
      "VRFCoordinatorV2Mock",
      owner,
    );
    vrfMock = await VRFMock.deploy();
    await vrfMock.waitForDeployment();

    const Manager = await ethers.getContractFactory("LotteryManager", owner);
    manager = await Manager.deploy();
    await manager.waitForDeployment();

    const Game = await ethers.getContractFactory("LotteryGame", owner);
    game = await Game.deploy(
      await vrfMock.getAddress(),
      ethers.ZeroHash,
      1,
      await manager.getAddress(),
    );
    await game.waitForDeployment();

    await manager.setGame(await game.getAddress());

    await manager.createLottery(
      "L",
      "Desc",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await manager.importLuckyNumbers(1, ["A", "B", "C"]);

    await manager.connect(user1).buyTicket(1, 0, { value: ticketPrice });
    await manager.connect(user2).buyTicket(1, 1, { value: ticketPrice });

    // solve problem with expiry dates
    snapshotId = await ethers.provider.send("evm_snapshot", []);
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine");
  });

  afterEach(async () => {
    await ethers.provider.send("evm_revert", [snapshotId]);
  });

  it("should call drawWinners and trigger VRF request", async () => {
    await expect(manager.connect(owner).drawWinners(1, 2)).to.not.be.reverted;
  });

  it("should handle fulfillRandomWords and distribute winnings", async () => {
    await manager.drawWinners(1, 2);

    const requestId = 1;
    const randomSeed = 123;
    await expect(
      vrfMock.callBackWithRandomness(
        requestId,
        [randomSeed],
        await game.getAddress(),
      ),
    ).to.not.be.reverted;

    // Check that the withdrawals were recorded
    const balance1 = await game.pendingWithdrawals(await user1.getAddress());
    const balance2 = await game.pendingWithdrawals(await user2.getAddress());

    expect(balance1 > 0n || balance2 > 0n).to.be.true;
    const ownerBalance = await game.pendingWithdrawals(
      await owner.getAddress(),
    );
    expect(ownerBalance).to.be.gt(0);
  });

  it("should allow withdrawal by winners and owner", async () => {
    await manager.drawWinners(1, 2);
    await vrfMock.callBackWithRandomness(1, [42], await game.getAddress());

    const payout = await game.pendingWithdrawals(user1.address);
    const before = await ethers.provider.getBalance(user1.address);

    const tx = await game.connect(user1).withdrawPayments();
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;
    // @ts-ignore
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const after = await ethers.provider.getBalance(user1.address);

    const delta = 10n ** 14n;
    const expected = before + payout;
    expect(after + gasUsed).to.be.gte(expected - delta);
    expect(after + gasUsed).to.be.lte(expected + delta);
  });
});
