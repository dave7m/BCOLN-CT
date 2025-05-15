// next.config.js

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Determine network
const TARGET_NETWORK = process.env.NEXT_PUBLIC_TARGET_NETWORK || "localhost";

// Load default .env.local
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// Conditionally load the right override
const envFilePath = `.env.${TARGET_NETWORK}.local`;
const envPath = path.resolve(__dirname, envFilePath);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment from ${envFilePath}`);
} else {
  console.warn(`Environment file ${envFilePath} not found.`);
}

// Export env variables
module.exports = {
  env: {
    NEXT_PUBLIC_TARGET_NETWORK: process.env.NEXT_PUBLIC_TARGET_NETWORK,
    NEXT_PUBLIC_LOCALHOST_VRF_COORDINATOR:
      process.env.NEXT_PUBLIC_LOCALHOST_VRF_COORDINATOR,
    LOCALHOST: process.env.LOCALHOST,
    LOCALHOST_USER_1_PRIVATE_KEY: process.env.LOCALHOST_USER_1_PRIVATE_KEY,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
    SEPOLIA_PRIVATE_KEY: process.env.SEPOLIA_PRIVATE_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};
