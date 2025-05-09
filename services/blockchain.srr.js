const managerAbi = require("../artifacts/contracts/LotteryManager.sol/LotteryManager.json");
const gameAbi = require("../artifacts/contracts/LotteryGame.sol/LotteryGame.json");
const {
  LotteryGame: gameAddress,
  LotteryManager: managerAddress,
} = require("../artifacts/contractAddresses.json");
const { formatEther, JsonRpcProvider, Contract, Wallet } = require("ethers");
const fromWei = (num) => formatEther(num);

const getEthereumContracts = async () => {
  const provider = new JsonRpcProvider("http://localhost:8545");
  const wallet = Wallet.createRandom().connect(provider);

  const manager = new Contract(managerAddress, managerAbi.abi, wallet);
  const game = new Contract(gameAddress, gameAbi.abi, wallet);

  return { manager, game };
};

const getLotteries = async () => {
  const { manager } = await getEthereumContracts();
  const lotteries = await manager.getLotteries();
  return structureLotteries(lotteries);
};

const getLottery = async (id) => {
  const { manager } = await getEthereumContracts();
  const raw = await manager.getLottery(id);
  return structureLotteries([raw])[0];
};

const getTotalLotteries = async () => {
  const { manager } = await getEthereumContracts();
  const raw = await manager.getTotalLotteries();
  return raw;
};

const getParticipants = async (id) => {
  const { manager } = await getEthereumContracts();
  const participants = await manager.getLotteryParticipants(id);
  return structuredParticipants(participants);
};

const getPurchasedNumbers = async (id) => {
  const { manager } = await getEthereumContracts();
  const participants = await manager.getLotteryParticipants(id);
  return structuredNumbers(participants);
};

const getLuckyNumbers = async (id) => {
  const { manager } = await getEthereumContracts();
  const luckyNumbers = await manager.getLuckyNumbers(id);
  return luckyNumbers;
};

const getLotteryResult = async (id) => {
  const { game } = await getEthereumContracts();
  const result = await game.getLotteryResults(id);
  return structuredResult(result);
};

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const monthOfYear = monthsOfYear[date.getMonth()];
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();

  return `${dayOfWeek} ${monthOfYear} ${dayOfMonth}, ${year}`;
}

const structureLotteries = (lotteries) =>
  lotteries.map((lottery) => ({
    id: Number(lottery.id),
    title: lottery.title,
    description: lottery.description,
    owner: lottery.owner.toLowerCase(),
    ticketPrice: fromWei(lottery.ticketPrice),
    servicePercent: Number(lottery.servicePercent),
    createdAt: formatDate(Number(lottery.createdAt + "000")),
    drawsAt: formatDate(Number(lottery.expiresAt + "000")),
    expiresAt: Number(lottery.expiresAt + "000"),
    participants: Number(lottery.numOfParticipants),
    drawn: lottery.drawn,
  }));

const structuredParticipants = (participants) =>
  participants.map((p) => ({
    account: p.account.toLowerCase(),
    lotteryNumber: p.lotteryNumber,
  }));

const structuredNumbers = (participants) =>
  participants.map((p) => p.lotteryNumber);

const structuredResult = (result) => {
  return {
    completed: result.completed,
    timestamp: Number(result.timestamp + "000"),
    prizePerWinner: fromWei(result.prizePerWinner),
    seed: Number(result.seed),
    winners: result.winners.map((winner) => ({
      account: winner.account,
      lotteryNumber: winner.lotteryNumber,
    })),
  };
};

module.exports = {
  getEthereumContracts,
  getLotteries,
  getLottery,
  structureLotteries,
  getLuckyNumbers,
  getParticipants,
  getPurchasedNumbers,
  getLotteryResult,
  getTotalLotteries,
};
