import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { getLuckyNumbers } from "../services/blockchain";
import { useEffect, useState } from "react";

const Jackpots = ({ jackpots }) => {
  const { wallet } = useSelector((state) => state.globalState);
  const ownJackpots = jackpots?.filter(
    (j) => j.owner.toLowerCase() === wallet?.toLowerCase(),
  );
  const otherJackpots = jackpots?.filter(
    (j) => j.owner.toLowerCase() !== wallet?.toLowerCase(),
  );
  return (
    <div className="bg-slate-100 py-10 px-5 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-slate-800">Lottery Jackpots</h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Discover the thrill of winning with our exciting lottery jackpots!
          Join now and experience the chance to win big!
        </p>
      </div>

      {/* Own Jackpots */}
      {ownJackpots.length > 0 && (
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold text-slate-700">
            Your Jackpots
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ownJackpots.map((jackpot, i) => (
              <Jackpot jackpot={jackpot} key={`own-${i}`} />
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {ownJackpots.length > 0 && otherJackpots.length > 0 && (
        <hr className="border-t-2 border-gray-300 my-8" />
      )}

      {/* Other Jackpots */}
      {otherJackpots.length > 0 && (
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold text-slate-700">
            Available Jackpots
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {otherJackpots.map((jackpot, i) => (
              <Jackpot jackpot={jackpot} key={`other-${i}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Jackpot = ({ jackpot }) => {
  const { wallet } = useSelector((state) => state.globalState);
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getLuckyNumbers(jackpot.id).then((res) => setLuckyNumbers(res));
  }, [jackpot]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-5 flex flex-col justify-between space-y-4 hover:shadow-xl transition duration-200">
      {/* Header Info */}
      <div className="flex items-center space-x-4">
        <Image
          width={100}
          height={100}
          src={jackpot.imageURL}
          alt="Jackpot Icon"
          className="rounded-xl w-20 h-20 object-cover"
        />
        <div className="flex flex-col text-sm text-slate-600">
          <span className="text-green-600 font-bold text-base">
            {jackpot.title}
          </span>
          <span className="text-xs">
            Draws On:{" "}
            {new Date(jackpot.drawsAtTimestamp).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <p className="text-sm text-slate-500 leading-5">
          Description: {jackpot.description}
        </p>
      </div>

      {/* Play Button */}
      {luckyNumbers.length > 0 || jackpot.owner === wallet ? (
        <Link
          href={`/${jackpot.expiresAt > now ? "jackpots" : "results"}/${jackpot.id}`}
          className="inline-block text-center bg-green-500 hover:bg-rose-600 transition text-white font-semibold py-2 px-4 rounded-full text-sm"
        >
          {jackpot.expiresAt < now
            ? "See Results"
            : jackpot.owner === wallet
              ? "Manage Jackpot"
              : "PLAY NOW"}
        </Link>
      ) : (
        <span className="inline-block text-center bg-gray-400 text-white font-semibold py-2 px-4 rounded-full text-sm cursor-not-allowed opacity-60">
          PLAY NOW
        </span>
      )}
    </div>
  );
};

export default Jackpots;
