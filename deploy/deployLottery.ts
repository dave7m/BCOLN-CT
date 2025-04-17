import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployLotteryContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const isLocal = network.name === "localhost" || network.name === "hardhat";

  log("Deploying LotteryManager...");
  const managerDeployment = await deploy("LotteryManager", {
    from: deployer,
    log: true,
  });

  log("Deploying LotteryGame...");
  const vrfCoordinator = (isLocal ? process.env.LOCALHOST_VRF_COORDINATOR : process.env.VRF_COORDINATOR) || ethers.ZeroAddress;
  const keyHash = isLocal && process.env.VRF_KEYHASH || ethers.ZeroHash;
  const subscriptionId = isLocal && process.env.VRF_SUBSCRIPTION_ID
      ? Number(process.env.VRF_SUBSCRIPTION_ID)
      : 1;
  console.log("Using vrfCoordinator at", vrfCoordinator, "keyHash", keyHash, "subscriptionId", subscriptionId);

  const gameDeployment = await deploy("LotteryGame", {
    from: deployer,
    args: [vrfCoordinator, keyHash, subscriptionId, managerDeployment.address],
    log: true,
  });

  const manager = await ethers.getContractAt("LotteryManager", managerDeployment.address);
  const tx = await manager.setGame(gameDeployment.address);
  await tx.wait();
  log(`Linked manager with game via setGame(${gameDeployment.address})`);
};

export default deployLotteryContracts;
deployLotteryContracts.tags = ["lottery"];
