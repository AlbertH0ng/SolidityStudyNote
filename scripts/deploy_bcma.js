const { ethers } = require("hardhat");

async function main() {
  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 部署 BCMA 代币合约
  console.log("\n开始部署 BCMA 代币合约...");
  const BCMA = await ethers.getContractFactory("BCMA");
  const initialSupply = 1000000; // 初始供应量：100万个代币
  const bcma = await BCMA.deploy(initialSupply);
  
  console.log("BCMA 合约部署中...");
  await bcma.waitForDeployment();
  
  const tokenAddress = await bcma.getAddress();
  console.log("BCMA 合约已部署到:", tokenAddress);
  console.log("代币名称:", await bcma.name());
  console.log("代币符号:", await bcma.symbol());
  console.log("代币小数位:", await bcma.decimals());
  
  // 获取总供应量（考虑小数位）
  const totalSupply = await bcma.totalSupply();
  const decimals = await bcma.decimals();
  const formattedTotalSupply = ethers.formatUnits(totalSupply, decimals);
  console.log("总供应量:", formattedTotalSupply, await bcma.symbol());
  
  // 部署者余额
  const deployerBalance = await bcma.balanceOf(deployer.address);
  const formattedDeployerBalance = ethers.formatUnits(deployerBalance, decimals);
  console.log("部署者代币余额:", formattedDeployerBalance, await bcma.symbol());
  
  console.log("\n部署完成！请保存以下信息：");
  console.log("合约地址:", tokenAddress);
  console.log("部署网络:", network.name);
  console.log("部署时间:", new Date().toISOString());
}

// 运行部署脚本
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });