import Link from "next/link";
import background from "../assets/background.jpg";
import { useSelector } from "react-redux";
import { connectWallet, truncate } from "../services/blockchain";

const SubHeader = () => {
  const { wallet } = useSelector((state) => state.globalState);

  return (
    <div
      style={{
        background: `url('${background.src}') no-repeat center center / cover`,
      }}
      className="flex items-center justify-between text-white px-6 md:px-20 py-4 shadow-md"
    >
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold tracking-wide">
        DappLottery
      </Link>

      {/* Future nav links if needed */}
      <div className="hidden lg:flex items-center space-x-6 font-medium">
        {/* Add menu links here */}
      </div>

      {/* Wallet Button */}
      {wallet ? (
        <button
          className="bg-amber-500 hover:bg-rose-600 text-sm font-semibold text-white
          py-2 px-4 rounded-full border border-transparent transition"
        >
          {truncate(wallet, 4, 4, 11)}
        </button>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-amber-500 hover:bg-rose-600 text-sm font-semibold text-white
          py-2 px-4 rounded-full border border-transparent transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default SubHeader;
