import { HDNodeWallet, Mnemonic } from "ethers";
import fs from "fs";

const ENV_FILE = ".env.localhost.local";

async function main() {
  const mnemonicPhrase =
    "test test test test test test test test test test test junk";
  const mnemonic = Mnemonic.fromPhrase(mnemonicPhrase);

  const privateKeys: string[] = [];

  for (let i = 0; i < 10; i++) {
    const wallet = HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`);
    privateKeys.push(wallet.privateKey);
  }

  let existingEnv = "";
  try {
    existingEnv = fs.readFileSync(ENV_FILE, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  const lines = existingEnv.split("\n");
  const updated: Record<string, string> = {};

  privateKeys.forEach((key, i) => {
    updated[`LOCALHOST_USER_${i + 1}_PRIVATE_KEY`] = `${key}`;
  });

  const newLines = lines.filter(Boolean).map((line) => {
    const [key] = line.split("=", 1);
    if (updated[key]) {
      const val = updated[key];
      delete updated[key];
      return `${key}=${val}`;
    }
    return line;
  });

  for (const [key, val] of Object.entries(updated)) {
    newLines.push(`${key}=${val}`);
  }
  console.log(newLines.join("\n"));

  fs.writeFileSync(ENV_FILE, newLines.join("\n") + "\n");
  console.log(`✅ Patched ${ENV_FILE} with LOCALHOST private keys`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
