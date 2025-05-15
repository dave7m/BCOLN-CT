import { globalActions } from "@/store/globalSlice";
import { store } from "@/store";

import {
  BrowserProvider,
  Contract,
  ContractRunner,
  formatEther,
  JsonRpcProvider,
  parseEther,
  Wallet,
} from "ethers";

import {
  ILotteryManager,
  LotteryGame as LotteryGameType,
  LotteryManager as LotteryManagerType,
} from "../typechain-types";
import { LotteryGame as LotteryGameNS } from "../typechain-types/contracts/LotteryGame";
import type { VRFCoordinatorV2Mock } from "@/typechain-types";

import managerAbi from "@/artifacts/contracts/LotteryManager.sol/LotteryManager.json";
import gameAbi from "@/artifacts/contracts/LotteryGame.sol/LotteryGame.json";
import vrfAbi from "@/artifacts/contracts/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json";
import { toast } from "react-toastify";
const network = process.env.NEXT_PUBLIC_TARGET_NETWORK || "localhost";
let contractAddresses;

try {
  contractAddresses = require(`../addresses/${network}.json`);
} catch (err) {
  throw new Error(
    `No contract address file found for network "${network}". Did you run the deployment?`,
  );
}
const {
  updateWallet,
  setLuckyNumbers,
  setParticipants,
  setPurchasedNumbers,
  setJackpot,
  setResult,
} = globalActions;

const getEthereum = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  return undefined;
};

const toWei = (num: bigint | number | string) => parseEther(num.toString());
const fromWei = (num: bigint) => formatEther(num);
type ParticipationStructStructOutput =
  ILotteryManager.ParticipationStructStructOutput;
type LotteryResultStructOutput = LotteryGameNS.LotteryResultStructOutput;
type LotteryStructStructOutput = ILotteryManager.LotteryStructStructOutput;

const { LotteryGame: gameAddress, LotteryManager: managerAddress } =
  contractAddresses;

const vrf_mock_coordinator =
  process.env.NEXT_PUBLIC_LOCALHOST_VRF_COORDINATOR || "";

const asTypedContract = <T>(
  address: string,
  abi: any,
  signer: ContractRunner,
): T => {
  return new Contract(address, abi, signer) as unknown as T;
};

const isBrowser = () => typeof window !== "undefined" && !!window.ethereum;

const getEthereumContracts = async (): Promise<{
  manager: LotteryManagerType;
  game: LotteryGameType;
}> => {
  if (isBrowser()) {
    const browserProvider = new BrowserProvider(window.ethereum!);
    const network = await browserProvider.getNetwork();
    const currentChainId = Number(network.chainId);
    const expectedChainId =
      process.env.NEXT_PUBLIC_TARGET_NETWORK === "sepolia" ? 11155111 : 31337;
    if (currentChainId !== expectedChainId) {
      throw new Error(
        `Wrong network! Expected chain ID ${expectedChainId}, but connected to ${currentChainId}. Please switch networks in Metamask.`,
      );
    }
    const signer = await browserProvider.getSigner();
    const manager = asTypedContract<LotteryManagerType>(
      managerAddress,
      managerAbi.abi,
      signer,
    );
    const game = asTypedContract<LotteryGameType>(
      gameAddress,
      gameAbi.abi,
      signer,
    );
    return { manager, game };
  }

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

const validateNetwork = async (ethereum: any) => {
  const expectedChainId =
    process.env.NEXT_PUBLIC_TARGET_NETWORK === "sepolia" ? 11155111 : 31337;

  const chainIdHex: string = await ethereum.request({ method: "eth_chainId" });
  const currentChainId = parseInt(chainIdHex, 16);

  if (currentChainId !== expectedChainId) {
    toast.warn(`Wrong network. Please change it in your MetaMask wallet!`);
    return false;
  }

  return true;
};

const isWalletConnected = async () => {
  const ethereum: any = requireEthereum();
  if (!ethereum) return;

  try {
    const accounts: string[] = await ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length) {
      await validateNetwork(ethereum);
      store.dispatch(updateWallet(accounts[0]));
    } else {
      store.dispatch(updateWallet(""));
      notifyUser("Please connect wallet.");
    }

    ethereum.removeAllListeners("accountsChanged");
    ethereum.removeAllListeners("chainChanged");

    ethereum.on("accountsChanged", async (newAccounts: string[]) => {
      if (newAccounts.length > 0) {
        const isCorrectNetwork = await validateNetwork(ethereum);
        store.dispatch(updateWallet(newAccounts[0]));
        if (isCorrectNetwork) {
          window.location.reload();
        }
      } else {
        store.dispatch(updateWallet(""));
      }
    });

    ethereum.on("chainChanged", async (_chainIdHex: string) => {
      const isCorrectNetwork = await validateNetwork(ethereum);
      if (isCorrectNetwork) {
        window.location.reload();
      }
    });
  } catch (error) {
    reportError(error);
  }
};

const requireEthereum = (): NonNullable<typeof window.ethereum> | undefined => {
  if (typeof window === "undefined") {
    console.warn("Metamask check attempted in a non-browser environment.");
    return;
  }
  const ethereum = window.ethereum;
  if (!ethereum) {
    notifyUser("Please install Metamask");
    return;
  }
  return ethereum;
};

const connectWallet = async () => {
  const ethereum = requireEthereum();
  if (!ethereum) return;

  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    store.dispatch(updateWallet(accounts[0]));
  } catch (error) {
    reportError(error);
  }
};

const createJackpot = async ({
  title,
  description,
  imageURL,
  ticketPrice,
  expiresAt,
  servicePercent,
}: {
  title: string;
  description: string;
  imageURL: string;
  ticketPrice: bigint;
  expiresAt: string;
  servicePercent: bigint;
}) => {
  const ethereum = requireEthereum();
  if (!ethereum) return;

  try {
    // const connectedAccount = store.getState().globalState.wallet
    const { manager } = await getEthereumContracts();

    const tx = await manager.createLottery(
      title,
      description,
      imageURL,
      toWei(ticketPrice),
      servicePercent,
      expiresAt,
    );
    await tx.wait();
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const buyTicket = async (
  lotteryId: bigint,
  luckyNumberId: bigint,
  ticketPrice: bigint,
) => {
  const ethereum = requireEthereum();
  if (!ethereum) return;

  try {
    // const connectedAccount = store.getState().globalState.wallet
    const { manager } = await getEthereumContracts();
    const tx = await manager.buyTicket(lotteryId, luckyNumberId, {
      value: toWei(ticketPrice),
    });
    const receipt = await tx.wait();
    const purchasedNumbers = await getPurchasedNumbers(lotteryId);
    const lotteryParticipants = await getParticipants(lotteryId);
    const lottery = await getLottery(lotteryId);

    store.dispatch(setPurchasedNumbers(purchasedNumbers));
    store.dispatch(setParticipants(lotteryParticipants));
    store.dispatch(setJackpot(lottery));
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const performDraw = async (lotteryId: bigint, numOfWinners: bigint) => {
  const ethereum = requireEthereum();
  if (!ethereum) return;

  try {
    const { manager } = await getEthereumContracts();
    const tx = await manager.drawWinners(lotteryId, numOfWinners);
    await tx.wait();

    await fulfillRandomness();

    const lotteryParticipants = await getParticipants(lotteryId);
    const lottery = await getLottery(lotteryId);
    const result = await getLotteryResult(lotteryId);

    store.dispatch(setParticipants(lotteryParticipants));
    store.dispatch(setJackpot(lottery));
    store.dispatch(setResult(result));
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const exportLuckyNumbers = async (
  lotteryId: bigint,
  luckyNumbers: string[],
) => {
  const ethereum = requireEthereum();
  if (!ethereum) return;

  try {
    const { manager } = await getEthereumContracts();
    const tx = await manager.importLuckyNumbers(lotteryId, luckyNumbers);
    await tx.wait();

    const updatedLuckyNumbers = await getLuckyNumbers(lotteryId);
    store.dispatch(setLuckyNumbers(updatedLuckyNumbers));
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const withdrawPayment = async (): Promise<void> => {
  const ethereum = requireEthereum();
  if (!ethereum) return;
  try {
    const { game } = await getEthereumContracts();
    const tx = await game.withdrawPayments();
    const receipt = await tx.wait();

    // make sure that it is actually paid out
    const event = receipt?.logs
      .map((log) => {
        try {
          return game.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed?.name === "Withdrawn");

    if (event) {
      const { recipient, amount } = event.args;
      console.log(
        `✅ Withdrawn to ${recipient}, amount: ${formatEther(amount)} ETH`,
      );
    } else {
      console.warn("❌ No Withdrawn event found");
    }
  } catch (error) {
    reportError(error);
    throw error;
  }
};

const reportError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Unknown error:", error);
  }
};

const notifyUser = (msg: string) => {
  console.log(msg);
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
  const result = await manager.getLuckyNumbers(id);
  return result;
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

const truncate = (
  text: string,
  startChars: number,
  endChars: number,
  maxLength: number,
) => {
  if (text.length > maxLength) {
    let start = text.substring(0, startChars);
    let end = text.substring(text.length - endChars);
    while (start.length + end.length < maxLength) {
      start += ".";
    }
    return start + end;
  }
  return text;
};

export {
  withdrawPayment,
  isWalletConnected,
  connectWallet,
  createJackpot,
  exportLuckyNumbers,
  buyTicket,
  performDraw,
  truncate,
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
