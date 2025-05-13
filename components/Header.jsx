import networking from "../assets/networking.png";
import background from "../assets/background.jpg";
import Image from "next/image";
import { useSelector } from "react-redux";
import { connectWallet, truncate } from "../services/blockchain";
import Link from "next/link";

const Header = () => {
  const { wallet } = useSelector((state) => state.globalState);

  return (
    <div
      className="px-6 md:px-32 lg:px-48"
      style={{
        background: `url('${background.src}') no-repeat center center fixed`,
        backgroundSize: "cover",
      }}
    >
      <div className="flex items-center justify-between text-white py-6 border-b border-white/20">
        <h1 className="text-2xl font-extrabold tracking-wide">
          🎯 DappLottery
        </h1>

        <div className="hidden lg:flex items-center gap-4 font-medium text-sm"></div>

        {wallet ? (
          <button
            className="flex items-center border border-white/30 py-2 px-4 rounded-full bg-white/10
            hover:bg-white/20 transition text-white text-sm backdrop-blur-sm"
          >
            {truncate(wallet, 4, 4, 11)}
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="flex items-center border border-white/30 py-2 px-4 rounded-full bg-gradient-to-r from-amber-500 to-pink-500
            hover:from-pink-500 hover:to-rose-600 transition text-white text-sm backdrop-blur-sm"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-between py-10">
        <div className="text-white max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 drop-shadow-md">
            Start Winning Big With DappLottery
          </h2>
          <p className="text-lg sm:text-xl text-white/90 drop-shadow-sm">
            The most exciting and rewarding lottery experience awaits you!
          </p>
        </div>

        <div className="mb-8 sm:mb-0 sm:ml-10">
          <Image
            src={networking}
            alt="network"
            width={320}
            height={320}
            className="rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="pb-16">
        <Link
          href={"/create"}
          className="inline-block bg-gradient-to-r from-amber-500 to-rose-600 hover:from-rose-600 hover:to-amber-500
          text-white font-semibold text-base py-3 px-6 rounded-full shadow-lg transition-all"
        >
          🎉 Create Jackpot
        </Link>
      </div>
    </div>
  );
};

export default Header;
