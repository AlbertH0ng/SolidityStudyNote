const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HelloWorld", function () {
  let helloWorld;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1, addr2] = await ethers.getSigners();

    // 部署合约
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    helloWorld = await HelloWorld.deploy("Hello, Solidity!");
  });

  describe("部署", function () {
    it("应该设置正确的初始消息", async function () {
      expect(await helloWorld.getMessage()).to.equal("Hello, Solidity!");
    });

    it("应该设置正确的拥有者", async function () {
      expect(await helloWorld.getOwner()).to.equal(owner.address);
    });
  });

  describe("消息管理", function () {
    it("拥有者应该能够更改消息", async function () {
      await helloWorld.setMessage("New message");
      expect(await helloWorld.getMessage()).to.equal("New message");
    });

    it("非拥有者不应该能够更改消息", async function () {
      await expect(
        helloWorld.connect(addr1).setMessage("Unauthorized message")
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("更改消息时应该触发事件", async function () {
      await expect(helloWorld.setMessage("Event test"))
        .to.emit(helloWorld, "MessageChanged")
        .withArgs("Event test", owner.address);
    });
  });
});