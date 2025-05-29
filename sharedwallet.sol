// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract SharedWallet {

    event Deposit(address indexed sender, uint amount, uint balanceafter, uint timestamp );
    event Withdrawal(address indexed sender, uint amount, uint balanceafter, uint timestamp);

    mapping(address => uint) public balances;

    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, balances[msg.sender], block.timestamp);
    }

    function myBalance() view external returns (uint) {
        return balances[msg.sender]; 
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, balances[msg.sender], block.timestamp);
    }
    
    function withdraw(uint amount) external  {
        require (amount <= balances[msg.sender], "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount, balances[msg.sender], block.timestamp);
    }

    function withdrawAll() external {
        require(balances[msg.sender] > 0, "Insufficient balance");
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;
        emit Withdrawal(msg.sender, amount, 0, block.timestamp);
        payable(msg.sender).transfer(amount);

    }
}