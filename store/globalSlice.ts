import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LotteryParticipant {
  account: string;
  lotteryNumber: string;
}

export interface Lottery {
  id: number;
  title: string;
  description: string;
  imageURL: string;
  owner: string;
  ticketPrice: string;
  servicePercent: number;
  createdAt: string;
  drawsAt: string;
  expiresAt: number;
  participants: number;
  drawn: boolean;
}

export interface LotteryResult {
  completed: boolean;
  timestamp: number;
  prizePerWinner: string;
  seed: number;
  winners: LotteryParticipant[];
}

interface GlobalState {
  wallet: string;
  generatorModal: string;
  winnerModal: string;
  currentUser: string | null;
  jackpots: Lottery[];
  jackpot: Lottery | null;
  luckyNumbers: string[];
  purchasedNumbers: string[];
  participants: LotteryParticipant[];
  result: LotteryResult | null;
}

const initialState: GlobalState = {
  wallet: "",
  generatorModal: "scale-0",
  winnerModal: "scale-0",
  currentUser: null,
  jackpots: [],
  jackpot: null,
  luckyNumbers: [],
  purchasedNumbers: [],
  participants: [],
  result: null,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setWinnerModal: (state, action) => {
      state.winnerModal = action.payload;
    },
    setGeneratorModal: (state, action) => {
      state.generatorModal = action.payload;
    },
    updateWallet: (state, action: PayloadAction<string>) => {
      state.wallet = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<string | null>) => {
      state.currentUser = action.payload;
    },
    setJackpots: (state, action: PayloadAction<Lottery[]>) => {
      state.jackpots = action.payload;
    },
    setJackpot: (state, action: PayloadAction<Lottery | null>) => {
      state.jackpot = action.payload;
    },
    setLuckyNumbers: (state, action: PayloadAction<string[]>) => {
      state.luckyNumbers = action.payload;
    },
    setPurchasedNumbers: (state, action: PayloadAction<string[]>) => {
      state.purchasedNumbers = action.payload;
    },
    setParticipants: (state, action: PayloadAction<LotteryParticipant[]>) => {
      state.participants = action.payload;
    },
    setResult: (state, action: PayloadAction<LotteryResult | null>) => {
      state.result = action.payload;
    },
  },
});

export const globalActions = globalSlice.actions;
export default globalSlice.reducer;
