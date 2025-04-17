import { expect } from "chai";
import { ethers } from "hardhat";
import type { LotteryManager } from "../typechain-types";

describe("LotteryManager", function () {
  let manager: LotteryManager;
  let owner: any, alice: any, bob: any;
  const ticketPrice = ethers.parseEther("0.01");
  const servicePercent = 10;
  const expiresInOneHour = Math.floor(Date.now() / 1000) + 3600;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const Mgr = await ethers.getContractFactory("LotteryManager", owner);
    manager = (await Mgr.deploy()) as LotteryManager;
    await manager.waitForDeployment();
  });

  it("should create & read back a lottery", async () => {
    await manager.createLottery(
      "My Lotto",
      "Description",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    const L = await manager.getLottery(1);
    expect(L.title).to.equal("My Lotto");
    expect(L.numOfParticipants).to.equal(0);
    expect(L.servicePercent).to.equal(servicePercent);
  });

  it("only owner can import lucky numbers", async () => {
    await manager.createLottery(
      "T",
      "D",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    // bob tries to import → revert
    await expect(
      manager.connect(bob).importLuckyNumbers(1, ["X", "Y"]),
    ).to.be.revertedWithCustomError(manager, "NoLotteryOwner");
    // owner succeeds
    await expect(manager.importLuckyNumbers(1, ["A", "B"])).to.emit(
      manager,
      "LuckyNumbersImported",
    );
  });

  it("cannot import twice", async () => {
    await manager.createLottery(
      "T",
      "D",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await manager.importLuckyNumbers(1, ["A"]);
    // second import
    await expect(
      manager.importLuckyNumbers(1, ["C"]),
    ).to.be.revertedWithCustomError(manager, "SimpleError");
  });

  it("getAvailableLuckyNumbers updates after each purchase", async () => {
    await manager.createLottery(
      "T",
      "D",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await manager.importLuckyNumbers(1, ["A", "B", "C"]);
    expect(await manager.getAvailableLuckyNumbers(1)).to.deep.equal([
      "A",
      "B",
      "C",
    ]);

    await manager.connect(alice).buyTicket(1, 1, { value: ticketPrice }); // uses "B"
    expect(await manager.getAvailableLuckyNumbers(1)).to.deep.equal(["A", "C"]);
  });

  it("allows buying tickets & updates jackpot", async () => {
    await manager.createLottery(
      "T",
      "D",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await manager.importLuckyNumbers(1, ["A", "B"]);
    await expect(
      manager.connect(alice).buyTicket(1, 0, { value: ticketPrice }),
    ).to.emit(manager, "TicketBought");
    await expect(
      manager.connect(bob).buyTicket(1, 1, { value: ticketPrice }),
    ).to.emit(manager, "TicketBought");

    const parts = await manager.getLotteryParticipants(1);
    expect(parts.length).to.equal(2);
    expect(parts[0]).to.equal(await alice.getAddress());
    expect(parts[1]).to.equal(await bob.getAddress());

    // jackpot = ticketPrice * 2
    expect(await manager.getJackpot(1)).to.equal(ticketPrice * 2n);
  });

  it("rejects insufficient ETH or reuse of same number", async () => {
    await manager.createLottery(
      "T",
      "D",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await manager.importLuckyNumbers(1, ["A"]);
    await expect(
      manager.connect(alice).buyTicket(1, 0, { value: 0 }),
    ).to.be.revertedWithCustomError(manager, "SimpleError");
    // buy once
    await manager.connect(alice).buyTicket(1, 0, { value: ticketPrice });
    // reuse
    await expect(
      manager.connect(bob).buyTicket(1, 0, { value: ticketPrice }),
    ).to.be.revertedWithCustomError(manager, "SimpleError");
  });

  it("only owner can setGame", async () => {
    await expect(
      manager.connect(alice).setGame(alice.address),
    ).to.be.revertedWithCustomError(manager, "OwnableUnauthorizedAccount");
    // owner
    await expect(manager.setGame(alice.address)).to.not.be.reverted;
  });
});
