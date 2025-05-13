import { globalActions } from "@/store/globalSlice";
import { store } from "@/store";

import { parseEther } from "ethers";
import {
  fulfillRandomness,
  getEthereumContracts,
  getLottery,
  getLotteryResult,
  getLuckyNumbers,
  getParticipants,
  getPurchasedNumbers,
} from "./blockchain.srr";

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

const isWalletConnected = async () => {
  const ethereum = requireEthereum();
  if (!ethereum) return;

  try {
    const accounts = await ethereum.request({ method: "eth_accounts" });

    ethereum?.on?.("chainChanged", () => window.location.reload());
    ethereum?.on?.("accountsChanged", async () => {
      store.dispatch(updateWallet(accounts[0]));
      await isWalletConnected();
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

const requireEthereum = (): NonNullable<typeof window.ethereum> | undefined => {
  const ethereum = getEthereum();
  if (!ethereum) {
    notifyUser("Please install Metamask");
    return;
  }
  return ethereum;
};

const connectWallet = async () => {
  const ethereum = requireEthereum();
  console.log(ethereum);
  if (!ethereum) return;

  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    console.log(updateWallet(accounts[0]));
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
  }
};

const exportLuckyNumbers = async (
  lotteryId: bigint,
  luckyNumbers: string[],
) => {
  const ethereum = requireEthereum();
  if (!ethereum) return;

  try {
    const connectedAccount = store.getState().globalState.wallet;
    const { manager } = await getEthereumContracts();
    const tx = await manager.importLuckyNumbers(lotteryId, luckyNumbers, {
      from: connectedAccount,
    });
    await tx.wait();

    const updatedLuckyNumbers = await getLuckyNumbers(lotteryId);
    store.dispatch(setLuckyNumbers(updatedLuckyNumbers));
  } catch (error) {
    reportError(error);
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
  isWalletConnected,
  connectWallet,
  createJackpot,
  exportLuckyNumbers,
  buyTicket,
  performDraw,
  truncate,
};
