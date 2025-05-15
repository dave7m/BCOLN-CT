# 🎰 UZH Uniswap V3 Lottery dApp

A decentralized lottery application using Solidity smart contracts, Chainlink VRF for randomness, and a modern Next.js frontend. This project ensures transparent, verifiable draws and automated prize distribution without intermediaries.

---

## 🧱 Monorepo Structure

```
.
├── .env* / .gitignore       # Environment & ignore files
├── assets/                  # Static images used in frontend
├── components/              # React components for Next.js app
├── contracts/               # Solidity smart contracts
├── deploy/                  # Hardhat deploy scripts (mock + production)
├── offchain/                # Off-chain utility (e.g., Supabase client)
├── pages/                   # Next.js pages including routes and API handlers
│   ├── api/                 # API endpoints
│   ├── jackpots/            # Jackpot detail pages
│   └── results/             # Result detail pages
├── public/                  # Public assets (favicon, etc.)
├── scripts/                 # Utility scripts
├── services/                # Blockchain-related logic (frontend/backend separation)
├── store/                   # Redux global state management
│   ├── actions/             # Redux actions
│   └── states/              # Initial/global states
├── styles/                  # CSS modules and global styles
├── test/                    # Hardhat tests
├── hardhat.config.ts        # Hardhat config (network, plugins, etc.)
├── tsconfig.json            # TypeScript config
├── yarn.lock / package.json # Project and workspace config
```

---

## 🛠️ Getting Started

### 📦 Prerequisites

- Node.js v18.12.1 (strict requirement)
- Yarn (v3.2.3 or higher)

---

### 🚀 Install Dependencies

Run from the project root:

```bash
yarn install
```

This installs dependencies for both the Hardhat backend and the `frontend/` workspace.

---

## ⚙️ Local Development Workflow

### 🔁 1. Start Local Hardhat Node

```bash
yarn run:local
```

This script:

- Starts the local Hardhat node
- Waits for it to be ready
- Extracts and saves test accounts
- Deploys mocks and lottery contracts
- Starts the frontend dev server

### 🧪 2. Add Local Network to MetaMask

Manually add the network:

- **Network Name:** `Hardhat Localhost`
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** `31337`

### 🔐 3. Import a Test Account

Copy one of the printed private keys from your terminal and import it in MetaMask under "Import Account".

### 🗃️ 4. Connect the DB for Off-chain Storage

This project uses [Supabase](https://supabase.com) to store uploaded jackpot images and optionally store metadata in a table.

- **Create a Supabase project** at [https://app.supabase.com](https://app.supabase.com)
- **Create a public bucket** in **Storage** named `jackpot-images`
- _(Optional)_ In **Database**, create a table `jackpot_images` to store metadata like `url`, `filename`, etc.
- **Get your keys** under **Project Settings → API**:
  - **SUPABASE_URL** — your project’s URL
  - **SUPABASE_ANON_KEY** — for safe frontend access
  - **SUPABASE_SERVICE_ROLE_KEY** — for backend-only DB access (⚠️ keep secret)

Add the following to your `.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 🎰 5. Use the dApp

Go to [http://localhost:3000](http://localhost:3000) and start creating/joining lotteries.

---

## 🌐 Deploy to Sepolia

To deploy to Sepolia testnet:

### 1. Setup Environment

Create a `.env.sepolia.local` file:

```dotenv
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_INFURA_KEY>
SEPOLIA_PRIVATE_KEY=0x...
VRF_COORDINATOR=...
VRF_KEYHASH=0x...
VRF_SUBSCRIPTION_ID=...
```

### 2. Deploy Contracts

```bash
yarn run:sepolia
```

This script:

- Sets the correct environment
- Deploys contracts to Sepolia
- Starts the frontend locally

Then visit:
[http://localhost:3000](http://localhost:3000)

Connect MetaMask to Sepolia and use a funded test account.

---

## 🔧 Available Scripts

### ✨ Compile Contracts

```bash
yarn compile
```

### 🧼 Clean Build Artifacts

```bash
yarn clean
```

### 📤 Deploy to Localhost

```bash
yarn deploy:local
```

Split steps:

```bash
yarn deploy:local:mocks
```

```bash
yarn deploy:local:lottery
```

### 🧪 Run Tests

```bash
yarn test
```

### 🔍 Lint Codebase

```bash
yarn lint
```

### 💅 Format Codebase

```bash
yarn format
```

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
- [Next.js](https://nextjs.org/)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
- [TypeScript](https://www.typescriptlang.org/)
