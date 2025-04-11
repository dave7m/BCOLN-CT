import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import * as dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

const test_net_url = process.env.TEST_NET || "";
const test_net_private_key = process.env.TEST_NET_PRIVATE_KEY || "";
const user_1_private_key = process.env.TEST_USER_1_PRIVATE_KEY || "";
const user_2_private_key = process.env.TEST_USER_2_PRIVATE_KEY || "";

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
    testnet: {
      url: test_net_url,
      accounts: [test_net_private_key, user_1_private_key, user_2_private_key],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
