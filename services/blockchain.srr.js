const managerAbi = require("../artifacts/contracts/LotteryManager.sol/LotteryManager.json");
const gameAbi = require("../artifacts/contracts/LotteryGame.sol/LotteryGame.json");
const {
  LotteryGame: gameAddress,
  LotteryManager: managerAddress,
} = require("../artifacts/contractAddresses.json");
const { formatEther, JsonRpcProvider, Contract, Wallet } = require("ethers");
const { loadEnv } = require("../loadEnv");

const fromWei = (num) => formatEther(num);
loadEnv();

const getEthereumContracts = async () => {
  const networkIsSepolia = process.env.TARGET_NETWORK === "sepolia";
  const rpcURL = networkIsSepolia
    ? process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
    : process.env.LOCALHOST;
  const privateKey = networkIsSepolia
    ? process.env.SEPOLIA_PRIVATE_KEY
    : process.env.LOCALHOST_USER_1_PRIVATE_KEY;

  if (!rpcURL || !privateKey) {
    throw new Error(
      `Missing RPC URL or Private Key for network: ${process.env.TARGET_NETWORK}`,
    );
  }

  console.log(`RPC URL: ${rpcURL}`);
  console.log(`Private Key for network: ${privateKey}`);

  const provider = new JsonRpcProvider(rpcURL);
  const wallet = new Wallet(privateKey, provider);

  const manager = new Contract(managerAddress, managerAbi.abi, wallet);
  const game = new Contract(gameAddress, gameAbi.abi, wallet);

  return { manager, game };
};

const getLotteries = async () => {
  const { manager } = await getEthereumContracts();
  console.log(manager);
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
  return await manager.getTotalLotteries();
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
    imageURL: lottery.imageURL,
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
  // getEthereumContracts,
  getLotteries,
  getLottery,
  structureLotteries,
  getLuckyNumbers,
  getParticipants,
  getPurchasedNumbers,
  getLotteryResult,
  getTotalLotteries,
};
