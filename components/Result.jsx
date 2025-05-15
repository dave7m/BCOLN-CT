import Link from "next/link";
import Identicon from "react-identicons";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft, FaEthereum } from "react-icons/fa";
import Countdown from "../components/Countdown";
import { globalActions } from "../store/globalSlice";
import { truncate, withdrawPayment } from "../services/blockchain";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Result = () => {
  const router = useRouter();
  const { wallet, jackpot, participants, result } = useSelector(
    (state) => state.globalState,
  );
  const { setWinnerModal } = globalActions;
  const dispatch = useDispatch();

  const handleWithdraw = async () => {
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await withdrawPayment()
          .then(async () => {
            router.push("/");
            resolve();
          })
          .catch(() => reject());
      }),
      {
        pending: "Approve transaction...",
        success: "Winnings withdrawn successfully.",
        error: "Encountered error 🤯",
      },
    );
  };
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 px-5 bg-slate-100 space-y-10 relative">
      {/* Back to Jackpot Button */}
      <Link
        href={jackpot?.drawn ? `/` : `/jackpots/${jackpot?.id}`}
        className="absolute top-8 left-8 bg-[#0c2856] text-white flex items-center gap-2 py-2 px-4 rounded-full hover:bg-[#1a396c] transition font-medium shadow-md"
      >
        <FaArrowLeft size={14} />
        <span>{jackpot?.drawn ? `Home` : `Jackpot`}</span>
      </Link>

      {/* Title & Summary */}
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <h1 className="text-4xl font-bold text-slate-800">Lottery Result</h1>
        <p className="text-lg text-slate-600 font-semibold capitalize">
          {jackpot?.title}
        </p>
        <p className="text-sm text-slate-500 w-full sm:w-2/3">
          {jackpot?.description}
        </p>
        <p className="text-sm text-slate-500 w-full sm:w-2/3">
          Result for{" "}
          <span className="font-medium text-green-600">
            {result?.winners?.length} winners
          </span>{" "}
          out of{" "}
          <span className="font-medium text-black">
            {jackpot?.participants} participants
          </span>{" "}
          <span className="font-medium text-gray-600">
            {result?.winners?.length > 0 ? "Drawn" : "Not Drawn"}
          </span>
        </p>
      </div>

      {/* Countdown & Action Buttons */}
      <div className="flex flex-col items-center space-y-4">
        {jackpot?.expiresAt && <Countdown timestamp={jackpot?.expiresAt} />}
        {!jackpot?.drawn && (
          <div className="flex flex-wrap justify-center items-center gap-3">
            {wallet?.toLowerCase() === jackpot?.owner &&
              jackpot?.participants > 0 && (
                <button
                  disabled={jackpot?.expiresAt > now}
                  onClick={() => dispatch(setWinnerModal("scale-100"))}
                  className={`bg-amber-500 text-white text-sm font-semibold py-2 px-4 rounded-full border border-transparent transition ${
                    jackpot?.expiresAt > now
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-rose-600"
                  }`}
                >
                  Perform Draw
                </button>
              )}
          </div>
        )}
      </div>
      {result?.winners
        ?.map((winner) => winner.account.toLowerCase())
        .includes(wallet) && (
        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={handleWithdraw}
            className={`bg-emerald-500 text-white text-sm font-semibold py-2 px-4 rounded-full border border-transparent transition `}
          >
            Withdraw Winnings
          </button>
        </div>
      )}

      {/* Participants Result */}
      <div className="bg-white rounded-xl shadow-md w-full sm:w-3/4 mx-auto p-6">
        <h4 className="text-2xl font-bold text-slate-700 text-center mb-4">
          Winners & Losers
        </h4>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {participants?.map((participant, i) => (
            <div
              key={i}
              className="flex justify-start items-center border-b border-gray-100 py-2 space-x-3"
            >
              <Identicon
                size={30}
                string={participants}
                className="rounded-full h-8 w-8"
              />
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <p className="font-medium text-slate-700">
                  {truncate(participant.account, 4, 4, 11)}
                </p>
                <p className="text-slate-500">#{participant.lotteryNumber}</p>
                {result?.winners
                  .map((winner) => winner.lotteryNumber)
                  .includes(participant.lotteryNumber) ? (
                  <p className="text-green-500 flex items-center font-semibold">
                    + <FaEthereum className="mx-1" /> {result?.prizePerWinner}{" "}
                    <span className="ml-1">Winner</span>
                  </p>
                ) : (
                  <p className="text-red-500 flex items-center font-medium">
                    - <FaEthereum className="mx-1" /> {jackpot?.ticketPrice}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
