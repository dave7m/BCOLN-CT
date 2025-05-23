import Head from "next/head";
import { useEffect } from "react";
import Result from "../../components/Result";
import Winners from "../../components/Winners";
import SubHeader from "../../components/SubHeader";
import { useDispatch } from "react-redux";
import { globalActions } from "../../store/globalSlice";
import {
  getLottery,
  getLotteryResult,
  getParticipants,
  performDraw,
} from "../../services/blockchain";
import { useRouter } from "next/router";

export default function Results({ lottery, participantList, lotteryResult }) {
  const { setParticipants, setJackpot, setResult } = globalActions;
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    dispatch(setResult(lotteryResult));
    dispatch(setJackpot(lottery));
    dispatch(setParticipants(participantList));
  }, []);

  const handleDraw = async (resultId, numberOfWinners) => {
    await performDraw(resultId, BigInt(numberOfWinners));
    const updatedParticipants = await getParticipants(BigInt(lottery.id));
    const updatedResult = await getLotteryResult(BigInt(lottery.id));
    const updatedLottery = await getLottery(BigInt(lottery.id));
    dispatch(setParticipants(updatedParticipants));
    dispatch(setJackpot(updatedLottery));
    dispatch(setResult(updatedResult));
    router.reload();
  };

  return (
    <div>
      <Head>
        <title>Dapp Lottery | Results</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-100">
        <SubHeader />
        <Result />
        <Winners onDraw={handleDraw} />
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  const { resultId } = context.query;
  const lottery = await getLottery(resultId);
  const participantList = await getParticipants(resultId);
  const lotteryResult = await getLotteryResult(resultId);
  return {
    props: {
      lottery: JSON.parse(JSON.stringify(lottery)),
      participantList: JSON.parse(JSON.stringify(participantList)),
      lotteryResult: JSON.parse(JSON.stringify(lotteryResult)),
    },
  };
};
