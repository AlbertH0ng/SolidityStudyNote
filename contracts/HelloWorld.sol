// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HelloWorld
 * @dev 一个简单的智能合约示例
 */
contract HelloWorld {
    string public message;
    address public owner;
    
    // 事件定义
    event MessageChanged(string newMessage, address changedBy);
    
    // 构造函数
    constructor(string memory _initialMessage) {
        message = _initialMessage;
        owner = msg.sender;
    }
    
    // 修改器：只有合约拥有者可以执行
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // 获取消息
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    // 设置新消息（只有拥有者可以调用）
    function setMessage(string memory _newMessage) public onlyOwner {
        message = _newMessage;
        emit MessageChanged(_newMessage, msg.sender);
    }
    
    // 获取合约拥有者
    function getOwner() public view returns (address) {
        return owner;
    }
}