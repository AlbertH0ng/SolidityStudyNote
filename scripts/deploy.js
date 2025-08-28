const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署 HelloWorld 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 获取合约工厂
  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  
  // 部署合约
  const helloWorld = await HelloWorld.deploy("Hello, Blockchain World!");
  
  console.log("合约部署中...");
  await helloWorld.waitForDeployment();
  
  console.log("HelloWorld 合约已部署到:", await helloWorld.getAddress());
  console.log("初始消息:", await helloWorld.getMessage());
  console.log("合约拥有者:", await helloWorld.getOwner());
}

// 运行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });