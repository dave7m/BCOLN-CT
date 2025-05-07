import contractAddresses from "@/artifacts/contractAddresses.json";
import managerAbi from "@/artifacts/contracts/LotteryManager.sol/LotteryManager.json";
import gameAbi from "@/artifacts/contracts/LotteryGame.sol/LotteryGame.json";
import vrfAbi from "../artifacts/contracts/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json";
import { globalActions } from "@/store/global_reducer";
import { store } from "@/store";
import {
  getLottery,
  getLotteryResult,
  getLuckyNumbers,
  getParticipants,
  getPurchasedNumbers,
} from "@/services/blockchain.srr";
import { BrowserProvider, Contract, parseEther } from "ethers";
import * as dotenv from "dotenv";

const {
  updateWallet,
  setLuckyNumbers,
  setParticipants,
  setPurchasedNumbers,
  setJackpot,
  setResult,
  setCurrentUser,
} = globalActions;

let tx, ethereum;
if (typeof window !== "undefined") {
  ethereum = window.ethereum;
}
dotenv.config({ path: ".env.local" });
const vrf_mock_coordinator =
  process.env.NEXT_PUBLIC_LOCALHOST_VRF_COORDINATOR || "";

const toWei = (num) => parseEther(num.toString());

const getEthereumContracts = async () => {
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  const manager = new Contract(
    contractAddresses.LotteryManager,
    managerAbi.abi,
    signer,
  );
  const game = new Contract(contractAddresses.LotteryGame, gameAbi.abi, signer);

  return { manager, game };
};

const isWalletConnected = async (CometChat) => {
  try {
    if (!ethereum) return notifyUser("Please install Metamask");
    const accounts = await ethereum.request({ method: "eth_accounts" });

    window.ethereum.on("chainChanged", () => window.location.reload());
    window.ethereum.on("accountsChanged", async () => {
      store.dispatch(updateWallet(accounts[0]));
      store.dispatch(setCurrentUser(null));
      logOutWithCometChat(CometChat).then(() => console.log("Logged out"));
      await isWalletConnected(CometChat);
    });

    if (accounts.length) {
      store.dispatch(updateWallet(accounts[0]));
    } else {
      store.dispatch(updateWallet(""));
      notifyUser("Please connect wallet.");
    }
  } catch (error) {
    reportError(error);
  }
};

const connectWallet = async () => {
  try {
    if (!ethereum) return notifyUser("Please install Metamask");
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
}) => {
  try {
    if (!ethereum) return notifyUser("Please install Metamask");
    // const connectedAccount = store.getState().globalState.wallet
    const { manager } = await getEthereumContracts();

    tx = await manager.createLottery(
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
  }
};

const buyTicket = async (lotteryId, luckyNumberId, ticketPrice) => {
  try {
    if (!ethereum) return notifyUser("Please install Metamask");
    // const connectedAccount = store.getState().globalState.wallet
    const { manager } = await getEthereumContracts();
    tx = await manager.buyTicket(lotteryId, luckyNumberId, {
      value: toWei(ticketPrice),
    });
    const receipt = await tx.wait();
    console.log(receipt);
    const purchasedNumbers = await getPurchasedNumbers(lotteryId);
    const lotteryParticipants = await getParticipants(lotteryId);
    const lottery = await getLottery(lotteryId);

    store.dispatch(setPurchasedNumbers(purchasedNumbers));
    store.dispatch(setParticipants(lotteryParticipants));
    store.dispatch(setJackpot(lottery));
  } catch (error) {
    reportError(error);
  }
};

// When using the mock vrf, we have to call back to game with the correct requestId
// if not using mock, it just returns
const fulfillRandomness = async () => {
  if (!ethereum) return notifyUser("Please install Metamask");
  const provider = new BrowserProvider(ethereum);
  const network = await provider.getNetwork();
  if (network.chainId !== 31337n) return;
  if (!vrf_mock_coordinator)
    throw new Error("Missing VRF coordinator address in .env.local");
  const signer = await provider.getSigner();

  const vrf = new Contract(vrf_mock_coordinator, vrfAbi.abi, signer);

  // find latest requestId (simplified assumption)
  const seed = Math.floor(Math.random() * 100000);
  const randomWords = [seed];
  const filter = vrf.filters.RandomWordsRequested();
  const events = await vrf.queryFilter(filter);
  const latest = events.at(-1);

  if (!latest) throw new Error("No randomWords request found");

  const requestId = latest.args.requestId;

  await vrf.callBackWithRandomness(
    requestId,
    randomWords,
    contractAddresses.LotteryGame,
  );
  console.log("✅ VRF fulfillment executed locally");
};

const performDraw = async (lotteryId, numOfWinners) => {
  try {
    if (!ethereum) return notifyUser("Please install Metamask");
    const { manager } = await getEthereumContracts();

    tx = await manager.drawWinners(lotteryId, numOfWinners);
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
  }
};

const exportLuckyNumbers = async (lotteryId, luckyNumbers) => {
  try {
    if (!ethereum) return notifyUser("Please install Metamask");
    const connectedAccount = store.getState().globalState.wallet;
    const { manager } = await getEthereumContracts();
    tx = await manager.importLuckyNumbers(lotteryId, luckyNumbers, {
      from: connectedAccount,
    });
    await tx.wait();

    const updatedLuckyNumbers = await getLuckyNumbers(lotteryId);
    store.dispatch(setLuckyNumbers(updatedLuckyNumbers));
  } catch (error) {
    reportError(error);
  }
};

const reportError = (error) => {
  console.error(error.message);
};

const notifyUser = (msg) => {
  console.log(msg);
};

const truncate = (text, startChars, endChars, maxLength) => {
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
  isWalletConnected,
  connectWallet,
  createJackpot,
  exportLuckyNumbers,
  buyTicket,
  performDraw,
  truncate,
};
