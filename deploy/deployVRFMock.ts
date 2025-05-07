import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import fs from "fs";

const ENV_FILE = ".env.local";
const KEY = "NEXT_PUBLIC_LOCALHOST_VRF_COORDINATOR";

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  if (network.name === "hardhat" || network.name === "localhost") {
    const { deployer } = await getNamedAccounts();
    const result = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [],
      log: true,
    });

    const deployedAddress = result.address;

    let existingEnv = "";
    try {
      existingEnv = fs.readFileSync(ENV_FILE, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }

    const lines = existingEnv.split("\n");
    let found = false;

    const newLines = lines.map((line) => {
      const [key] = line.split("=", 1);
      if (key === KEY) {
        found = true;
        return `${KEY}=${deployedAddress}`;
      }
      return line;
    });

    if (!found) {
      newLines.push(`${KEY}=${deployedAddress}`);
    }

    fs.writeFileSync(ENV_FILE, newLines.join("\n") + "\n");
    console.log(`✅ Updated ${KEY} in .env.local: ${deployedAddress}`);
  }
};

export default deployMocks;
deployMocks.tags = ["mocks"];
