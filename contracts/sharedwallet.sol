// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SharedWallet is ReentrancyGuard {

    event Deposit(address indexed sender, uint amount, uint balanceafter, uint timestamp );
    event Withdrawal(address indexed sender, uint amount, uint balanceafter, uint timestamp);

    mapping(address => uint) public balances;

    function myBalance() view external returns (uint) {
        return balances[msg.sender]; 
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, balances[msg.sender], block.timestamp);
    }

    receive() external payable {
        deposit();
    }

    function withdraw(uint amount) external nonReentrant {
        require (amount <= balances[msg.sender], "Insufficient balance");

        balances[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, amount, balances[msg.sender], block.timestamp);
    }

    function withdrawAll() external nonReentrant {
        require(balances[msg.sender] > 0, "Insufficient balance");

        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawal(msg.sender, amount, 0, block.timestamp);

    }
}