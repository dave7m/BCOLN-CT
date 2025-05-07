# 🎰 UZH Uniswap V3 Lottery dApp

A decentralized lottery application using Solidity smart contracts, Chainlink VRF for randomness, and a modern Next.js frontend. This project ensures transparent, verifiable draws and automated prize distribution without intermediaries.

---

## 🧱 Monorepo Structure

```
.
├── contracts/       # Solidity smart contracts
├── components/      # Next.js frontend app
├── deploy/          # Hardhat deploy scripts (mock + production)
├── test/              # Hardhat tests
├── deployments/       # Network deployment outputs (addresses & ABIs)
├── hardhat.config.js  # Hardhat config (network, plugins, etc.)
├── package.json       # Monorepo root config
├── package.json     # Root monorepo config
└── yarn.lock
```

---

## 🛠️ Getting Started

### 📦 Prerequisites

- Node.js v18.12.1 (strictly required)
- Yarn (v3.2.3 or higher)

---

### 🚀 Install Dependencies

Run this from the root of the project:

```bash
yarn install
```

Installs packages for both:

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

## 🎮 Development Usage

### 🔧 Compile Contracts

```bash
yarn compile
```

### 🧹 Clean Build Artifacts

```bash
yarn clean
```

### 📆 Deploy Mocks Locally

For VRF testing, deploy the mock VRF coordinator:

```bash
yarn deploy:local:mocks
```

### 🎲 Deploy Lottery Contracts Locally

```bash
yarn deploy:local:lottery
```

This deploys:

- `LotteryManager`: Ownable contract for creating lotteries
- `LotteryGame`: VRF-integrated contract for drawing winners

Also links both contracts automatically (`setGame()`).

For deploying contracts to a blockchain, we need to use the private_key of an account.
Please create a `env.local` file, where you can store your private keys. Do not expose
them outside of this. Also, you must give the RPC_URL a blockchain.
Your `env.local` file should then look like this:

```dotenv
LOCALHOST_VRF_COORDINATOR=0x...  # address of VRFCoordinatorV2Mock
VRF_KEYHASH=0x...
VRF_SUBSCRIPTION_ID=1
```

---

### 🧪 Run Tests

_Tests are currently being implemented._

```bash
yarn test
```

---

### 🧼 Lint the Codebase

```bash
yarn lint
```

Runs:

- `next lint` in `frontend/`
- `solhint` in `contracts/`

---

### 💅 Format Codebase

```bash
yarn format
```

Runs Prettier across the entire project.

---

### 🖥️ Run the Frontend

From root:

```bash
yarn workspace frontend dev
```

Visit:
[http://localhost:3000](http://localhost:3000)

---

## 🧠 Project Goals

- Transparent and fair lottery system
- On-chain randomness via Chainlink VRF
- Automated prize payout via smart contracts
- Clean dApp architecture with separation of concerns

---

## 🧑‍💻 Tech Stack

- [Solidity](https://soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [Chainlink VRF v2](https://docs.chain.link/vrf/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Next.js (App Router)](https://nextjs.org/)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
- [TypeScript](https://www.typescriptlang.org/)

---
