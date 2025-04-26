import Link from 'next/link'
import Image from 'next/image'
import { truncate } from '@/services/blockchain'

const Jackpots = ({ jackpots }) => {
  return (
    <div className="bg-slate-100 pt-5">
      <div className=" flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800 py-5">Lottery Jackpots</h1>
        <p className="text-center text-sm text-slate-600">
            Discover the thrill of winning with our exciting lottery jackpots! Join now and experience the chance to win big!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-4 lg:gap-3 py-10 w-4/5 mx-auto">
        {jackpots?.map((jackpot, i) => (
          <Jackpot jackpot={jackpot} key={i} />
        ))}
      </div>
    </div>
  )
}

const Jackpot = ({ jackpot }) => {
  return (
    <div className="w-full shadow-xl shadow-black rounded-md overflow-hidden bg-gray-800 my-2 px-3 py-5">
      <div className="flex justify-start items-center space-x-2">
        <Image
          width={100}
          height={512}
          src={jackpot.image}
          alt="icon"
          className="rounded-lg w-20"
        />
        <div>
          <p className="text-green-300">Upto: {jackpot.prize} ETH</p>
          <p className="text-sm text-gray-500">Draws On: {jackpot.drawsAt}</p>
        </div>
      </div>
      <div className="py-5">
        <p className="font-semibold pb-2 text-green-300">{jackpot.title}</p>
        <p className="text-sm leading-5 text-gray-500">{truncate(jackpot.description, 90, 3, 0)}</p>
      </div>
      <Link
        href={'/jackpots/' + jackpot.id}
        className="bg-green-500 hover:bg-rose-600 py-2 px-5
              rounded-md text-white font-semibold"
      >
        PLAY NOW
      </Link>
    </div>
  )
}

export default Jackpots
