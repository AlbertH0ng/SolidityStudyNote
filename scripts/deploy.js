const { ethers } = require("hardhat");

async function main() {
  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 部署 HelloWorld 合约
  console.log("\n开始部署 HelloWorld 合约...");
  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWorld.deploy("Hello, Blockchain World!");
  
  console.log("HelloWorld 合约部署中...");
  await helloWorld.waitForDeployment();
  
  console.log("HelloWorld 合约已部署到:", await helloWorld.getAddress());
  console.log("初始消息:", await helloWorld.getMessage());
  console.log("合约拥有者:", await helloWorld.getOwner());

  // 部署 SimpleToken 合约
  console.log("\n开始部署 SimpleToken 合约...");
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const initialSupply = 1000000; // 初始供应量：100万个代币
  const simpleToken = await SimpleToken.deploy(initialSupply);
  
  console.log("SimpleToken 合约部署中...");
  await simpleToken.waitForDeployment();
  
  const tokenAddress = await simpleToken.getAddress();
  console.log("SimpleToken 合约已部署到:", tokenAddress);
  console.log("代币名称:", await simpleToken.name());
  console.log("代币符号:", await simpleToken.symbol());
  console.log("代币小数位:", await simpleToken.decimals());
  
  // 获取总供应量（考虑小数位）
  const totalSupply = await simpleToken.totalSupply();
  const decimals = await simpleToken.decimals();
  const formattedTotalSupply = ethers.formatUnits(totalSupply, decimals);
  console.log("总供应量:", formattedTotalSupply, await simpleToken.symbol());
  
  // 部署者余额
  const deployerBalance = await simpleToken.balanceOf(deployer.address);
  const formattedDeployerBalance = ethers.formatUnits(deployerBalance, decimals);
  console.log("部署者代币余额:", formattedDeployerBalance, await simpleToken.symbol());
}

// 运行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });