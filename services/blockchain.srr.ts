import {
  ILotteryManager,
  LotteryGame as LotteryGameType,
  LotteryManager as LotteryManagerType,
} from "../typechain-types";

import {LotteryGame as LotteryGameNS} from "../typechain-types/contracts/LotteryGame";
import type {VRFCoordinatorV2Mock} from "@/typechain-types";

import managerAbi from "../artifacts/contracts/LotteryManager.sol/LotteryManager.json";
import gameAbi from "../artifacts/contracts/LotteryGame.sol/LotteryGame.json";
import vrfAbi from "../artifacts/contracts/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json";

import {Contract, ContractRunner, formatEther, JsonRpcProvider, Wallet,} from "ethers";
import {loadEnv} from "@/loadEnv";

loadEnv();

const network = process.env.NEXT_PUBLIC_TARGET_NETWORK || "localhost";
let contractAddresses;

try {
  contractAddresses = require(`../addresses/${network}.json`);
} catch (err) {
  throw new Error(
    `No contract address file found for network "${network}". Did you run the deployment?`,
  );
}

type ParticipationStructStructOutput =
  ILotteryManager.ParticipationStructStructOutput;
type LotteryResultStructOutput = LotteryGameNS.LotteryResultStructOutput;
type LotteryStructStructOutput = ILotteryManager.LotteryStructStructOutput;

const { LotteryGame: gameAddress, LotteryManager: managerAddress } =
  contractAddresses;

const vrf_mock_coordinator =
  process.env.NEXT_PUBLIC_LOCALHOST_VRF_COORDINATOR || "";

const fromWei = (num: bigint) => formatEther(num);

const asTypedContract = <T>(
  address: string,
  abi: any,
  signer: ContractRunner,
): T => {
  return new Contract(address, abi, signer) as unknown as T;
};

const getEthereumContracts = async (): Promise<{
  manager: LotteryManagerType;
  game: LotteryGameType;
}> => {
  const networkIsSepolia = process.env.NEXT_PUBLIC_TARGET_NETWORK === "sepolia";
  const rpcURL = networkIsSepolia
    ? process.env.SEPOLIA_RPC_URL
    : process.env.LOCALHOST;
  const privateKey = networkIsSepolia
    ? process.env.SEPOLIA_PRIVATE_KEY
    : process.env.LOCALHOST_USER_1_PRIVATE_KEY;

  if (!rpcURL || !privateKey) {
    throw new Error(
      `Missing RPC URL or Private Key for network: ${process.env.NEXT_PUBLIC_TARGET_NETWORK}`,
    );
  }

  const provider = new JsonRpcProvider(rpcURL);
  const wallet = new Wallet(privateKey, provider);

  const manager = asTypedContract<LotteryManagerType>(
    managerAddress,
    managerAbi.abi,
    wallet,
  );
  const game = asTypedContract<LotteryGameType>(
    gameAddress,
    gameAbi.abi,
    wallet,
  );

  return { manager, game };
};

const getLotteries = async () => {
  const { manager } = await getEthereumContracts();
  const lotteries: LotteryStructStructOutput[] = await manager.getLotteries();
  return structureLotteries(lotteries);
};

const getLottery = async (id: bigint) => {
  const { manager } = await getEthereumContracts();
  const raw: LotteryStructStructOutput = await manager.getLottery(id);
  return structureLotteries([raw])[0];
};

const getTotalLotteries = async () => {
  const { manager } = await getEthereumContracts();
  const totalLotteries: bigint = await manager.getTotalLotteries();
  return Number(totalLotteries);
};

const getParticipants = async (id: bigint) => {
  const { manager } = await getEthereumContracts();
  const participants: ParticipationStructStructOutput[] =
    await manager.getLotteryParticipants(id);
  return structuredParticipants(participants);
};

const getPurchasedNumbers = async (id: bigint) => {
  const { manager } = await getEthereumContracts();
  const participants: ParticipationStructStructOutput[] =
    await manager.getLotteryParticipants(id);
  return structuredNumbers(participants);
};

const getLuckyNumbers = async (id: bigint) => {
  const { manager } = await getEthereumContracts();
  return await manager.getLuckyNumbers(id);
};

const getLotteryResult = async (id: bigint) => {
  const { game } = await getEthereumContracts();
  const result: LotteryResultStructOutput = await game.getLotteryResults(id);
  return structuredResult(result);
};

// When using the mock vrf, we have to call back to game with the correct requestId
// if not using mock, it just returns
const fulfillRandomness = async () => {
  const networkIsLocalhost =
    (process.env.NEXT_PUBLIC_TARGET_NETWORK || "localhost") === "localhost";
  if (!networkIsLocalhost) {
    return;
  }

  if (!vrf_mock_coordinator)
    throw new Error(
      `Missing VRF coordinator address in .env.${process.env.NEXT_PUBLIC_TARGET_NETWORK}.local`,
    );

  const rpcURL = process.env.LOCALHOST;
  const privateKey = process.env.LOCALHOST_USER_1_PRIVATE_KEY;

  if (!rpcURL || !privateKey) {
    throw new Error("Missing LOCALHOST RPC URL or PRIVATE_KEY in environment.");
  }

  const provider = new JsonRpcProvider(rpcURL);
  const signer = new Wallet(privateKey, provider);

  const vrf = asTypedContract<VRFCoordinatorV2Mock>(
    vrf_mock_coordinator,
    vrfAbi.abi,
    signer,
  );

  // find latest requestId (simplified assumption)
  const seed = Math.floor(Math.random() * 100000);
  const randomWords = [seed];
  const filter = vrf.filters.RandomWordsRequested();
  const events = await vrf.queryFilter(filter);
  const latest = events.at(-1);

  if (!latest) throw new Error("No randomWords request found");

  const requestId = latest.args.requestId;

  await vrf.callBackWithRandomness(requestId, randomWords, gameAddress);
  console.log("✅ VRF fulfillment executed locally");
};

function formatDate(timestamp: string | number | Date) {
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

const structureLotteries = (lotteries: LotteryStructStructOutput[]) =>
  lotteries.map((lottery: LotteryStructStructOutput) => ({
    id: Number(lottery.id),
    title: lottery.title,
    description: lottery.description,
    imageURL: lottery.imageURL,
    owner: lottery.owner.toLowerCase(),
    ticketPrice: fromWei(lottery.ticketPrice),
    servicePercent: Number(lottery.servicePercent),
    createdAt: formatDate(Number(lottery.createdAt + "000")),
    drawsAt: formatDate(Number(lottery.expiresAt + "000")),
    drawsAtTimestamp: Number(lottery.expiresAt + "000"),
    expiresAt: Number(lottery.expiresAt + "000"),
    participants: Number(lottery.numOfParticipants),
    drawn: lottery.drawn,
  }));

const structuredParticipants = (
  participants: ParticipationStructStructOutput[],
) =>
  participants.map((p) => ({
    account: p.account.toLowerCase(),
    lotteryNumber: p.lotteryNumber,
  }));

const structuredNumbers = (participants: ParticipationStructStructOutput[]) =>
  participants.map((p) => p.lotteryNumber);

const structuredResult = (result: LotteryResultStructOutput) => {
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

export {
  getEthereumContracts,
  fulfillRandomness,
  getLotteries,
  getLottery,
  structureLotteries,
  getLuckyNumbers,
  getParticipants,
  getPurchasedNumbers,
  getLotteryResult,
  getTotalLotteries,
};
