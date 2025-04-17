import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import * as dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

const localhost_url = process.env.LCOALHOST || "";
const localhost_user_1_private_key = process.env.LOCALHOST_USER_1_PRIVATE_KEY || "";
const localhost_user_2_private_key = process.env.LOCALHOST_USER_2_PRIVATE_KEY || "";
const localhost_user_3_private_key = process.env.LOCALHOST_USER_3_PRIVATE_KEY || "";

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
      accounts: [localhost_user_1_private_key, localhost_user_2_private_key, localhost_user_3_private_key],
    },
    // TODO - Add Live Testnet for VRF
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
