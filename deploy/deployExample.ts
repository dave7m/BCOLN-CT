import {DeployFunction} from "hardhat-deploy/dist/types";
import {abi, bytecode} from "../artifacts/contracts/HelloWorldContract.sol/HelloWorldContract.json"
import { ethers } from "hardhat";
import {ContractFactory} from "ethers";
import {HardhatRuntimeEnvironment} from "hardhat/types";

const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // as defined in hardhat.config.ts under accounts{}
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log(
        "Account balance:",
        (await ethers.provider.getBalance(deployer)).toString()
    );


    const Contract = new ContractFactory(abi, bytecode, deployer)
    const contract = await Contract.deploy("Hello World!");
    console.log("Contract deployed to:", await contract.getAddress());

}

export default deploy;