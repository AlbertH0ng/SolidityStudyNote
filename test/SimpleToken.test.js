const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
  let simpleToken;
  let owner;
  let addr1;
  let addr2;
  let initialSupply = 1000000; // 初始供应量：100万个代币

  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1, addr2] = await ethers.getSigners();

    // 部署合约
    const SimpleToken = await ethers.getContractFactory("SimpleToken");
    simpleToken = await SimpleToken.deploy(initialSupply);
  });

  describe("部署", function () {
    it("应该设置正确的代币名称和符号", async function () {
      expect(await simpleToken.name()).to.equal("SimpleToken");
      expect(await simpleToken.symbol()).to.equal("SIM");
    });

    it("应该设置正确的小数位数", async function () {
      expect(await simpleToken.decimals()).to.equal(18);
    });

    it("应该设置正确的总供应量", async function () {
      const expectedSupply = ethers.parseUnits(initialSupply.toString(), 18);
      expect(await simpleToken.totalSupply()).to.equal(expectedSupply);
    });

    it("应该将所有代币分配给部署者", async function () {
      const totalSupply = await simpleToken.totalSupply();
      expect(await simpleToken.balanceOf(owner.address)).to.equal(totalSupply);
    });
  });

  describe("转账功能", function () {
    it("应该能够转移代币", async function () {
      // 转移100个代币给addr1
      const transferAmount = ethers.parseUnits("100", 18);
      await simpleToken.transfer(addr1.address, transferAmount);

      // 检查余额变化
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("如果发送者余额不足，应该回滚", async function () {
      // 获取总供应量
      const totalSupply = await simpleToken.totalSupply();
      
      // 尝试转移超过余额的代币
      await expect(
        simpleToken.connect(addr1).transfer(addr2.address, totalSupply)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("应该触发Transfer事件", async function () {
      const transferAmount = ethers.parseUnits("100", 18);
      
      await expect(simpleToken.transfer(addr1.address, transferAmount))
        .to.emit(simpleToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });
  });

  describe("授权和代理转账", function () {
    it("应该能够授权其他地址代表自己转移代币", async function () {
      const approveAmount = ethers.parseUnits("100", 18);
      await simpleToken.approve(addr1.address, approveAmount);
      
      expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(approveAmount);
    });

    it("应该能够通过授权进行代理转账", async function () {
      const approveAmount = ethers.parseUnits("100", 18);
      const transferAmount = ethers.parseUnits("50", 18);
      
      // 授权addr1可以转移owner的代币
      await simpleToken.approve(addr1.address, approveAmount);
      
      // addr1代表owner转移代币给addr2
      await simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      
      // 检查余额变化
      expect(await simpleToken.balanceOf(addr2.address)).to.equal(transferAmount);
      
      // 检查授权额度减少
      expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(approveAmount - transferAmount);
    });

    it("如果授权额度不足，应该回滚", async function () {
      const approveAmount = ethers.parseUnits("50", 18);
      const transferAmount = ethers.parseUnits("100", 18);
      
      // 授权addr1可以转移owner的代币
      await simpleToken.approve(addr1.address, approveAmount);
      
      // 尝试转移超过授权额度的代币
      await expect(
        simpleToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });

    it("应该触发Approval事件", async function () {
      const approveAmount = ethers.parseUnits("100", 18);
      
      await expect(simpleToken.approve(addr1.address, approveAmount))
        .to.emit(simpleToken, "Approval")
        .withArgs(owner.address, addr1.address, approveAmount);
    });
  });
});