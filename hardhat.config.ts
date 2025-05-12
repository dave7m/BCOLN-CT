import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import { loadEnv } from "./loadEnv";
import { ZeroHash } from "ethers";

loadEnv();

const localhost_url = process.env.LOCALHOST || "";
const localhost_user_1_private_key =
  process.env.LOCALHOST_USER_1_PRIVATE_KEY || ZeroHash;
const localhost_user_2_private_key =
  process.env.LOCALHOST_USER_2_PRIVATE_KEY || ZeroHash;
const localhost_user_3_private_key =
  process.env.LOCALHOST_USER_3_PRIVATE_KEY || ZeroHash;
const sepolia_url = process.env.SEPOLIA_RPC_URL || "";
const sepolia_private_key = process.env.SEPOLIA_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    localhost: {
      url: localhost_url,
      chainId: 31337,
      accounts: [
        localhost_user_1_private_key,
        localhost_user_2_private_key,
        localhost_user_3_private_key,
      ],
    },
    sepolia: {
      url: sepolia_url,
      chainId: 11155111,
      accounts: [sepolia_private_key],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
