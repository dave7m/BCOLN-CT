import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  if (network.name === "hardhat" || network.name === "localhost") {
    const { deployer } = await getNamedAccounts();
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [],
      log: true,
    });
  }
};

export default deployMocks;
deployMocks.tags = ["mocks"];
