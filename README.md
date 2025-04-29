# 🎰 UZH Uniswap V3 Lottery dApp

A decentralized lottery application built with Solidity smart contracts, a Next.js frontend (App Router), and Ethereum-based deployment (Hardhat). This project demonstrates transparency, randomness, and trust through verifiable lottery draws and automated prize distribution.

---

## 🧱 Monorepo Structure

```
.
├── contracts/       # Solidity smart contracts
├── components/        # Next.js frontend app
├── deploy/          # Hardhat scripts for deployment & interaction
├── test/            # Smart contract test files
├── offchain/        # Off-chain oracle / IPFS integrations
├── deployments/     # Deployment output (contract addresses & ABIs)
├── hardhat.config.js
├── package.json     # Root monorepo config
└── yarn.lock
```

---

## 🛠️ Getting Started

### 📦 Prerequisites

- Node.js (v18+ recommended)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (`npm install -g yarn`)

---

### 🚀 Install Dependencies

1. Run this from the root of the project:

```bash
yarn install
```

This will install dependencies for:
- Root (Hardhat + Solidity)
- `frontend/` workspace (React, Next.js, etc.)

2. Start Local Node

   Start the Hardhat Local Node
   In Terminal #1, run:
```bash
yarn hardhat node
```
3. Add Local Network to MetaMask

   Open MetaMask and go to **Settings > Networks > Add a network manually**. Enter:

   - **Network Name:** `Hardhat Localhost`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337` *(Hardhat's default)*
   - **Currency Symbol:** `ETH` *(optional)*
   - **Block Explorer URL:** *(leave blank)*

4. Import a Test Account into MetaMask

   When the Hardhat node starts, it displays 20 unlocked accounts with private keys. Example:

   ```
   Account #0: 0xabc...123
   Private Key: 0xabc...def
   ```

   - In MetaMask, go to the **Account menu > Import Account**
   - Paste one of the private keys from the terminal output

5. Deploy Contracts
   In Terminal #2, run the following commands:
```bash
yarn hardhat run deploy/deployExample.ts

yarn dev
```

Then open your browser at: http://localhost:3000

Now you can connect your MetaMask wallet to the local Hardhat node and create jackpot.

**_Temporarily ignore the following content._**



---

## 🎮 Usage

### 🔧 Compile Contracts

```bash
yarn compile
```

### 🧹 Clean Artifacts

```bash
yarn clean
```

### 🚀 Deploy Locally (testnet / localhost)

For deploying contracts to a blockchain, we need to use the private_key of an account.
Please create a `env.local` file, where you can store your private keys. Do not expose
them outside of this. Also, you must give the RPC_URL a blockchain.
Your `env.local` file should then look like this:

```dotenv
TEST_NET_PRIVATE_KEY='0x...'
TEST_NET=http://127.0.0.1:7545
```

```bash
yarn deploy:local
```

_(Customize your Hardhat networks in `hardhat.config.js`)_

Once you have deployed a contract, you can interact with it:
```js
const contract = await ethers.getContractAt("HelloWorldContract", "0x...");
await contract.getMessage();
```

---

### 🧪 Run Tests

Coming soon: `yarn test`

---

### 🧼 Lint the Codebase

```bash
yarn lint
```

This runs:
- `next lint` in the `frontend/` workspace
- `solhint` on Solidity contracts

### 💅 Format All Files

```bash
yarn format
```

Runs Prettier across the whole monorepo.

---

### 🖥️ Run the Frontend

From the root:

```bash
yarn workspace frontend dev
```

Then open your browser at:
[http://localhost:3000](http://localhost:3000)

---

## 🧠 Project Goals

- Transparent and fair lottery system
- On-chain randomness via Chainlink VRF
- Automated prize payout via smart contracts
- Clean dApp architecture with separation of concerns

---

## 🧑‍💻 Tech Stack

- [Hardhat](https://hardhat.org/)
- [Next.js (App Router)](https://nextjs.org/)
- [Solidity](https://soliditylang.org/)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
- [Chainlink VRF (planned)](https://docs.chain.link/vrf/)

---