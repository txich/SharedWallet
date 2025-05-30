import { ethers } from "hardhat";
import { expect } from "chai";
import { SharedWallet } from "../typechain-types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("SharedWallet", function () {
  let wallet: SharedWallet;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let walletAddr: string;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Wallet = await ethers.getContractFactory("SharedWallet");
    wallet = await Wallet.deploy();
    await wallet.waitForDeployment();
    walletAddr = await wallet.getAddress();
  });

  it("should accept deposits via deposit() and update balance", async function () {
    const depositAmount = ethers.parseEther("1");
    await expect(
      wallet.connect(addr1).deposit({ value: depositAmount })
    )
      .to.emit(wallet, "Deposit")
      .withArgs(addr1.address, depositAmount, depositAmount, anyValue);

    const balance = await wallet.connect(addr1).myBalance();
    expect(balance).to.equal(depositAmount);
  });

  it("should accept ETH via receive() and update balance", async function () {
    const amount = ethers.parseEther("0.5");
    await expect(
      addr1.sendTransaction({ to: walletAddr, value: amount })
    )
      .to.emit(wallet, "Deposit")
      .withArgs(addr1.address, amount, amount, anyValue);

    const balance = await wallet.connect(addr1).myBalance();
    expect(balance).to.equal(amount);
  });

  it("should withdraw specified amount and emit event", async function () {
    const depositAmount = ethers.parseEther("2");
    await wallet.connect(addr1).deposit({ value: depositAmount });

    const withdrawAmount = ethers.parseEther("1");
    const expectedBalance = depositAmount - withdrawAmount;
    await expect(
      wallet.connect(addr1).withdraw(withdrawAmount)
    )
      .to.emit(wallet, "Withdrawal")
      .withArgs(
        addr1.address,
        withdrawAmount,
        expectedBalance,
        anyValue
      );

    const newBalance = await wallet.connect(addr1).myBalance();
    expect(newBalance).to.equal(expectedBalance);
  });

  it("should revert withdraw if insufficient balance", async function () {
    await expect(
      wallet.connect(addr1).withdraw(ethers.parseEther("1"))
    ).to.be.revertedWith("Insufficient balance");
  });

  it("should withdraw all balance using withdrawAll", async function () {
    const depositAmount = ethers.parseEther("1.5");
    await wallet.connect(addr1).deposit({ value: depositAmount });

    await expect(wallet.connect(addr1).withdrawAll())
      .to.emit(wallet, "Withdrawal")
      .withArgs(addr1.address, depositAmount, 0, anyValue);

    const newBalance = await wallet.connect(addr1).myBalance();
    expect(newBalance).to.equal(0);
  });

  it("should revert withdrawAll if balance is zero", async function () {
    await expect(wallet.connect(addr1).withdrawAll()).to.be.revertedWith(
      "Insufficient balance"
    );
  });
});
