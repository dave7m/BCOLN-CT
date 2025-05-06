import Head from 'next/head'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import SubHeader from '../components/SubHeader'
import { createJackpot } from '@/services/blockchain'

export default function Create() {
  const { wallet } = useSelector((state) => state.globalState)
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [prize, setPrize] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!wallet) return toast.warning('Wallet not connected')

    if (!title || !description || !imageUrl || !prize || !ticketPrice || !expiresAt) return

    const params = {
      title,
      description,
      imageUrl,
      prize,
      ticketPrice,
      expiresAt: new Date(expiresAt).getTime(),
    }

    await toast.promise(
        new Promise(async (resolve, reject) => {
          await createJackpot(params)
              .then(async () => {
                onReset()
                router.push('/')
                resolve()
              })
              .catch(() => reject())
        }),
        {
          pending: 'Approve transaction...',
          success: 'Jackpot created successfully 👌',
          error: 'Encountered error 🤯',
        }
    )
  }

  const onReset = () => {
    setTitle('')
    setDescription('')
    setImageUrl('')
    setPrize('')
    setTicketPrice('')
    setExpiresAt('')
  }

  return (
      <div>
        <Head>
          <title>Dapp Lottery - Create New Jackpot</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
          <SubHeader />
          <div className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mb-10">
              <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
                🎉 Create a Jackpot
              </h1>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Launch your own lottery event. <br className="hidden sm:inline" />
                Simple, fast, and fully decentralized.
              </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md space-y-5"
            >
              <input
                  className="input-style"
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
              />
              <input
                  className="input-style"
                  type="url"
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
              />
              <input
                  className="input-style"
                  type="number"
                  step={0.01}
                  min={0.01}
                  placeholder="Prize"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  required
              />
              <input
                  className="input-style"
                  type="number"
                  step={0.01}
                  min={0.01}
                  placeholder="Ticket Price"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  required
              />
              <input
                  className="input-style"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  required
              />
              <textarea
                  className="input-style h-24 resize-none"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
              ></textarea>

              <button
                  type="submit"
                  className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700
              font-bold rounded-md transition-shadow shadow-md hover:shadow-lg"
              >
                🚀 Submit Jackpot
              </button>
            </form>
          </div>
        </div>
      </div>
  )
}