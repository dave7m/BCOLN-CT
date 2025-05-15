import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { FaArrowLeft, FaEthereum } from "react-icons/fa";
import Countdown from "@/components/Countdown";
import { buyTicket } from "@/services/blockchain";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "../store/globalSlice";

const DrawTime = ({ jackpot, luckyNumbers, participants }) => {
  const { setGeneratorModal } = globalActions;
  const { wallet, currentUser, group } = useSelector(
    (state) => state.globalState,
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const { jackpotId } = router.query;

  const handlePurchase = async (luckyNumberId) => {
    if (!wallet) return toast.warning("Connect your wallet");
    await toast.promise(
      new Promise(async (resolve, reject) => {
        await buyTicket(jackpotId, luckyNumberId, jackpot?.ticketPrice)
          .then(async () => resolve())
          .catch(() => reject());
      }),
      {
        pending: "Approve transaction...",
        success: "Ticket purchased successfully 👌",
        error: "Encountered error 🤯",
      },
    );
  };

  const onGenerate = () => {
    if (luckyNumbers.length > 0) return toast.warning("Already generated");
    dispatch(setGeneratorModal("scale-100"));
  };

  return (
    <div className="py-10 px-5 bg-slate-100 relative">
      <Link
        href={`/`}
        className="absolute top-8 left-8 bg-[#0c2856] text-white flex items-center gap-2 py-2 px-4 rounded-full hover:bg-[#1a396c] transition font-medium shadow-md"
      >
        <FaArrowLeft size={14} />
        <span>Jackpots</span>
      </Link>
      <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
        <h4 className="text-4xl text-slate-800 font-bold">
          Buy Lottery Tickets Online
        </h4>
        <p className="text-lg text-slate-600 font-medium">{jackpot?.title}</p>
        <p className="text-sm text-slate-500 w-full sm:w-2/3">
          {jackpot?.description}
        </p>
        <p className="text-sm font-medium text-slate-700">
          {jackpot?.participants} participants
        </p>
      </div>

      <div className="flex flex-col justify-center items-center space-y-4 mb-8">
        {jackpot?.expiresAt && <Countdown timestamp={jackpot?.expiresAt} />}

        <div className="flex justify-center items-center flex-wrap gap-4">
          {wallet?.toLowerCase() === jackpot?.owner && (
            <button
              disabled={jackpot?.expiresAt < Date.now()}
              onClick={onGenerate}
              className={`bg-amber-500 text-white text-sm font-semibold py-2 px-4 rounded-full border border-transparent transition ${
                jackpot?.expiresAt < Date.now()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-rose-600"
              }`}
            >
              Generate Lucky Numbers
            </button>
          )}

          {wallet?.toLowerCase() === jackpot?.owner?.toLowerCase() ? (
            <Link
              href={`/results/` + jackpot?.id}
              className="bg-[#0c2856] text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-[#1a396c] transition"
            >
              Draw Result
            </Link>
          ) : (
            <Link
              href={`/results/` + jackpot?.id}
              className="bg-[#0c2856] text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-[#1a396c] transition"
            >
              Show Result
            </Link>
          )}
        </div>
      </div>

      {
        <div className="bg-white rounded-xl shadow-md w-full sm:w-3/4 mx-auto p-6 overflow-x-auto text-sm">
          <p className="text-center text-2xl font-semibold text-slate-700 mb-4">
            Select Your Winning Lottery Numbers
          </p>
          <table className="table-auto w-full">
            <thead>
              <tr className="text-left text-slate-600 font-semibold border-b">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Ticket Price</th>
                <th className="py-3 px-4">Draw Date</th>
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {luckyNumbers?.map((luckyNumber, i) => (
                <tr key={i} className="border-b text-slate-700">
                  <td className="py-3 px-4 font-medium">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <FaEthereum className="text-amber-500" />
                      <span>{jackpot?.ticketPrice}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{jackpot?.drawsAt}</td>
                  <td className="py-3 px-4">{luckyNumber}</td>
                  <td className="py-3 px-4">
                    <button
                      disabled={participants.includes(luckyNumber)}
                      onClick={() => handlePurchase(i)}
                      className={`bg-black text-white text-sm py-2 px-4 rounded-full transition ${
                        participants.includes(luckyNumber)
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-rose-600"
                      }`}
                    >
                      BUY NOW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default DrawTime;
