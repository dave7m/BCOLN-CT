import { ethers as baseEthers } from "ethers";
import fs from "fs";

const ENV_FILE = ".env.local";

async function main() {
    const mnemonic = "test test test test test test test test test test test junk";
    const hdNode = baseEthers.utils.HDNode.fromMnemonic(mnemonic);

    const privateKeys: string[] = [];

    for (let i = 0; i < 10; i++) {
        const derived = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
        privateKeys.push(derived.privateKey);
    }

    let existingEnv = "";
    try {
        existingEnv = fs.readFileSync(ENV_FILE, "utf8");
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }

    const lines = existingEnv.split("\n");
    const updated: Record<string, string> = {};

    // Build new keys
    privateKeys.forEach((key, i) => {
        updated[`LOCALHOST_USER_${i + 1}_PRIVATE_KEY`] = `"${key}"`;
    });

    // Update or preserve lines
    const newLines = lines.filter(Boolean).map((line) => {
        const [key] = line.split("=", 1);
        if (updated[key]) {
            const val = updated[key];
            delete updated[key];
            return `${key}=${val}`;
        }
        return line;
    });

    // Append any remaining new keys
    for (const [key, val] of Object.entries(updated)) {
        newLines.push(`${key}=${val}`);
    }

    fs.writeFileSync(ENV_FILE, newLines.join("\n") + "\n");
    console.log("✅ Patched .env.local with LOCALHOST private keys");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
