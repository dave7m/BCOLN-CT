const dotenv = require("dotenv");

function loadEnv() {
    dotenv.config();
    dotenv.config({ path: ".env.local" });
    dotenv.config({ path: `.env.sepolia.local` });
    dotenv.config({ path: `.env.localhost.local` });
}

module.exports = { loadEnv };
