import Link from 'next/link'
import Image from 'next/image'
import { truncate } from '@/services/blockchain'

const Jackpots = ({ jackpots }) => {
    return (
        <div className="bg-slate-100 py-10 px-5 space-y-10">
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold text-slate-800">Lottery Jackpots</h1>
                <p className="text-sm text-slate-600 max-w-xl mx-auto">
                    Discover the thrill of winning with our exciting lottery jackpots! Join now and experience the chance to win big!
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {jackpots?.map((jackpot, i) => (
                    <Jackpot jackpot={jackpot} key={i} />
                ))}
            </div>
        </div>
    )
}

const Jackpot = ({ jackpot }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-5 flex flex-col justify-between space-y-4 hover:shadow-xl transition duration-200">
            {/* Header Info */}
            <div className="flex items-center space-x-4">
                <Image
                    width={100}
                    height={100}
                    src={jackpot.image}
                    alt="Jackpot Icon"
                    className="rounded-xl w-20 h-20 object-cover"
                />
                <div className="flex flex-col text-sm text-slate-600">
                    <span className="text-green-600 font-bold text-base">Up to {jackpot.prize} ETH</span>
                    <span className="text-xs">Draws On: {jackpot.drawsAt}</span>
                </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-800">{jackpot.title}</h2>
                <p className="text-sm text-slate-500 leading-5">
                    {truncate(jackpot.description, 90, 3, 0)}
                </p>
            </div>

            {/* Play Button */}
            <Link
                href={`/jackpots/${jackpot.id}`}
                className="inline-block text-center bg-green-500 hover:bg-rose-600 transition text-white font-semibold py-2 px-4 rounded-full text-sm"
            >
                PLAY NOW
            </Link>
        </div>
    )
}

export default Jackpots
