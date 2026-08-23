import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Factory = await hre.ethers.getContractFactory("CarbonCreditTrading");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  console.log("CarbonCreditTrading deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
