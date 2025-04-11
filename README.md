# 🎰 UZH Uniswap V3 Lottery dApp

A decentralized lottery application built with Solidity smart contracts, a Next.js frontend (App Router), and Ethereum-based deployment (Hardhat). This project demonstrates transparency, randomness, and trust through verifiable lottery draws and automated prize distribution.

---

## 🧱 Monorepo Structure

```
.
├── contracts/       # Solidity smart contracts
├── frontend/        # Next.js frontend app
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

Run this from the root of the project:

```bash
yarn install
```

This will install dependencies for:

- Root (Hardhat + Solidity)
- `frontend/` workspace (React, Next.js, etc.)

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
