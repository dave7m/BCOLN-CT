import { expect } from "chai";
import { ethers } from "hardhat";
import { LotteryManager } from "../typechain-types";

describe("LotteryManager", function () {
  let lottery: LotteryManager;
  let owner: any;
  let addr1: any;
  let addr2: any;

  const ticketPrice = ethers.parseEther("0.01");
  const servicePercent = 10;
  const expiresInOneHour = Math.floor(Date.now() / 1000) + 3600;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const LotteryManagerFactory =
      await ethers.getContractFactory("LotteryManager", owner);
    lottery = (await LotteryManagerFactory.deploy()) as LotteryManager;
    await lottery.waitForDeployment();
  });

  it("should create a lottery", async function () {
    await lottery.createLottery(
      "Test",
      "Test description",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    const result = await lottery.getLottery(1);
    expect(result.title).to.equal("Test");
  });

  it("should allow the owner to import lucky numbers", async function () {
    await lottery.createLottery(
      "Test",
      "Test description",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await lottery.importLuckyNumbers(1, ["ABC", "DEF"]);
    const available = await lottery.getAvailableLuckyNumbers(1);
    expect(available).to.deep.equal(["ABC", "DEF"]);
  });

  it("should allow a user to buy a ticket", async function () {
    await lottery.createLottery(
        "Test",
        "Test description",
        ticketPrice,
        servicePercent,
        expiresInOneHour,
    );
    await lottery.importLuckyNumbers(1, ["ABC"]);

    const lotteryAsAddr1 = lottery.connect(addr1); // 👈 use this
    await expect(lotteryAsAddr1.buyTicket(1, 0, { value: ticketPrice })).to.emit(lotteryAsAddr1, "TicketBought");

    const participants = await lottery.getParticipants(1);
    expect(participants.length).to.equal(1);
    expect(participants[0].account).to.equal(await addr1.getAddress());
    expect(participants[0].lotteryNumber).to.equal("ABC");
  });

  it("should reject buying with insufficient ETH", async function () {
    await lottery.createLottery(
      "Test",
      "Test description",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await lottery.importLuckyNumbers(1, ["ABC"]);
    const lotteryAsAddr1 = lottery.connect(addr1); // 👈 use this
    // await expect(
    //     lotteryAsAddr1.buyTicket(1, 0, { value: 0 })
    // ).to.be.revertedWithCustomError(lottery, "SimpleError");
    await expect(
      lotteryAsAddr1.buyTicket(1, 0, { value: 0 }),
    ).to.be.reverted;
  });



  it("should prevent reusing a lucky number", async function () {
    await lottery.createLottery(
      "Test",
      "Test description",
      ticketPrice,
      servicePercent,
      expiresInOneHour,
    );
    await lottery.importLuckyNumbers(1, ["ABC"]);
    await lottery.connect(addr1).buyTicket(1, 0, { value: ticketPrice });
    await expect(
      lottery.connect(addr2).buyTicket(1, 0, { value: ticketPrice }),
    ).to.be.reverted;
  });
});
