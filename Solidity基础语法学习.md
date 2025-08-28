# Solidity 基础语法学习指南

## 目录
1. [Solidity 简介](#solidity-简介)
2. [基本语法](#基本语法)
3. [数据类型](#数据类型)
4. [函数](#函数)
5. [修改器](#修改器)
6. [事件](#事件)
7. [继承](#继承)
8. [错误处理](#错误处理)
9. [实践练习](#实践练习)

## Solidity 简介

Solidity 是一种面向对象的高级编程语言，专门用于编写在以太坊虚拟机（EVM）上运行的智能合约。它受到 C++、Python 和 JavaScript 的影响。

### 特点
- **静态类型语言**：变量类型在编译时确定
- **面向对象**：支持继承、库和复杂的用户定义类型
- **安全性**：内置安全特性，防止常见的智能合约漏洞

## 基本语法

### 合约结构
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MyContract {
    // 状态变量
    uint256 public myNumber;
    
    // 构造函数
    constructor(uint256 _initialValue) {
        myNumber = _initialValue;
    }
    
    // 函数
    function setNumber(uint256 _newNumber) public {
        myNumber = _newNumber;
    }
}
```

### 许可证标识符
```solidity
// SPDX-License-Identifier: MIT
```
指定代码的许可证类型，这是必需的。

### Pragma 指令
```solidity
pragma solidity ^0.8.24;
```
指定编译器版本，`^0.8.24` 表示兼容 0.8.24 及以上版本（但不包括 0.9.0）。

## 数据类型

### 值类型

#### 布尔类型
```solidity
bool public isActive = true;
bool public isComplete = false;
```

#### 整数类型
```solidity
// 无符号整数
uint8 public smallNumber;    // 0 到 255
uint256 public bigNumber;    // 0 到 2^256 - 1
uint public defaultUint;     // 等同于 uint256

// 有符号整数
int8 public smallSigned;     // -128 到 127
int256 public bigSigned;     // -2^255 到 2^255 - 1
int public defaultInt;       // 等同于 int256
```

#### 地址类型
```solidity
address public owner;
address payable public recipient;  // 可以接收以太币的地址
```

#### 字节类型
```solidity
bytes1 public singleByte;
bytes32 public hash;
bytes public dynamicBytes;   // 动态字节数组
```

#### 字符串类型
```solidity
string public name = "Hello World";
string public description;
```

### 引用类型

#### 数组
```solidity
// 固定长度数组
uint[5] public fixedArray;

// 动态数组
uint[] public dynamicArray;
string[] public stringArray;

// 数组操作
function arrayOperations() public {
    dynamicArray.push(1);           // 添加元素
    dynamicArray.pop();             // 删除最后一个元素
    uint length = dynamicArray.length;  // 获取长度
}
```

#### 映射（Mapping）
```solidity
// 基本映射
mapping(address => uint256) public balances;
mapping(string => bool) public permissions;

// 嵌套映射
mapping(address => mapping(address => uint256)) public allowances;

function mappingOperations() public {
    balances[msg.sender] = 100;     // 设置值
    uint256 balance = balances[msg.sender];  // 获取值
}
```

#### 结构体
```solidity
struct Person {
    string name;
    uint256 age;
    address wallet;
}

Person[] public people;
mapping(address => Person) public personByAddress;

function createPerson(string memory _name, uint256 _age) public {
    Person memory newPerson = Person({
        name: _name,
        age: _age,
        wallet: msg.sender
    });
    
    people.push(newPerson);
    personByAddress[msg.sender] = newPerson;
}
```

## 函数

### 函数可见性
```solidity
contract VisibilityExample {
    uint256 private privateVar;
    uint256 internal internalVar;
    uint256 public publicVar;
    
    // private: 只能在当前合约内部调用
    function privateFunction() private pure returns (string memory) {
        return "Private function";
    }
    
    // internal: 可以在当前合约和继承合约中调用
    function internalFunction() internal pure returns (string memory) {
        return "Internal function";
    }
    
    // public: 可以从任何地方调用
    function publicFunction() public pure returns (string memory) {
        return "Public function";
    }
    
    // external: 只能从外部调用
    function externalFunction() external pure returns (string memory) {
        return "External function";
    }
}
```

### 函数修饰符
```solidity
contract StateExample {
    uint256 public value;
    
    // view: 不修改状态，可以读取状态变量
    function getValue() public view returns (uint256) {
        return value;
    }
    
    // pure: 不读取也不修改状态
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }
    
    // payable: 可以接收以太币
    function deposit() public payable {
        value += msg.value;
    }
    
    // 普通函数：可以修改状态
    function setValue(uint256 _newValue) public {
        value = _newValue;
    }
}
```

### 函数参数和返回值
```solidity
contract FunctionExample {
    // 多个参数和返回值
    function calculate(uint256 a, uint256 b) 
        public 
        pure 
        returns (uint256 sum, uint256 product) 
    {
        sum = a + b;
        product = a * b;
        // 可以显式返回
        // return (sum, product);
    }
    
    // 使用 memory 和 calldata
    function processString(string memory _input) 
        public 
        pure 
        returns (string memory) 
    {
        return _input;
    }
    
    function processArray(uint256[] calldata _numbers) 
        external 
        pure 
        returns (uint256) 
    {
        uint256 sum = 0;
        for (uint256 i = 0; i < _numbers.length; i++) {
            sum += _numbers[i];
        }
        return sum;
    }
}
```

## 修改器

修改器用于在函数执行前后添加条件检查或其他逻辑。

```solidity
contract ModifierExample {
    address public owner;
    bool public paused = false;
    
    constructor() {
        owner = msg.sender;
    }
    
    // 只有拥有者可以调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    // 合约未暂停时可以调用
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    // 带参数的修改器
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    // 使用修改器
    function pause() public onlyOwner {
        paused = true;
    }
    
    function unpause() public onlyOwner {
        paused = false;
    }
    
    function sensitiveOperation() public onlyOwner whenNotPaused {
        // 只有拥有者在合约未暂停时可以调用
    }
    
    function transferOwnership(address newOwner) 
        public 
        onlyOwner 
        validAddress(newOwner) 
    {
        owner = newOwner;
    }
}
```

## 事件

事件用于记录智能合约的重要操作，可以被前端应用监听。

```solidity
contract EventExample {
    // 事件定义
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Log(string message);
    
    mapping(address => uint256) public balances;
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        
        // 触发事件
        emit Transfer(msg.sender, to, amount);
        emit Log("Transfer completed");
    }
}
```

## 继承

Solidity 支持多重继承。

```solidity
// 基础合约
contract Ownable {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    function transferOwnership(address newOwner) public virtual onlyOwner {
        owner = newOwner;
    }
}

// 另一个基础合约
contract Pausable {
    bool public paused = false;
    
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }
    
    function _pause() internal {
        paused = true;
    }
    
    function _unpause() internal {
        paused = false;
    }
}

// 继承多个合约
contract MyToken is Ownable, Pausable {
    mapping(address => uint256) public balances;
    
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        balances[to] += amount;
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // 重写父合约函数
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Invalid address");
        super.transferOwnership(newOwner);
    }
}
```

## 错误处理

### require 语句
```solidity
function withdraw(uint256 amount) public {
    require(amount > 0, "Amount must be greater than 0");
    require(balances[msg.sender] >= amount, "Insufficient balance");
    
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);
}
```

### assert 语句
```solidity
function divide(uint256 a, uint256 b) public pure returns (uint256) {
    assert(b != 0);  // 用于检查不应该发生的条件
    return a / b;
}
```

### revert 语句
```solidity
function complexOperation(uint256 value) public {
    if (value < 10) {
        revert("Value too small");
    }
    
    // 复杂逻辑...
}
```

### 自定义错误（Solidity 0.8.4+）
```solidity
error InsufficientBalance(uint256 available, uint256 required);
error InvalidAddress(address addr);

function transfer(address to, uint256 amount) public {
    if (to == address(0)) {
        revert InvalidAddress(to);
    }
    
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(balances[msg.sender], amount);
    }
    
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

## 实践练习

### 练习 1：简单的代币合约
创建一个简单的 ERC20 代币合约，包含以下功能：
- 总供应量
- 余额查询
- 转账功能
- 授权和代理转账

### 练习 2：投票合约
创建一个投票合约，包含：
- 候选人注册
- 投票功能
- 结果查询
- 只允许每个地址投票一次

### 练习 3：简单的拍卖合约
创建一个拍卖合约，包含：
- 出价功能
- 最高出价者跟踪
- 拍卖结束功能
- 退款机制

## 常用全局变量和函数

```solidity
contract GlobalExample {
    function getGlobalInfo() public view returns (
        address sender,
        uint256 value,
        uint256 gasPrice,
        uint256 blockNumber,
        uint256 timestamp
    ) {
        sender = msg.sender;        // 调用者地址
        value = msg.value;          // 发送的以太币数量
        gasPrice = tx.gasprice;     // 交易的 gas 价格
        blockNumber = block.number; // 当前区块号
        timestamp = block.timestamp; // 当前区块时间戳
    }
    
    function hashExample(string memory text) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(text));
    }
    
    function addressExample() public view returns (uint256) {
        return address(this).balance;  // 合约余额
    }
}
```

## 最佳实践

1. **使用最新的 Solidity 版本**
2. **遵循检查-效果-交互模式**
3. **使用 SafeMath 库（0.8.0 之前的版本）**
4. **限制 gas 使用量**
5. **使用事件记录重要操作**
6. **进行充分的测试**
7. **代码审计**

## 下一步学习

- 深入学习 ERC 标准（ERC20、ERC721、ERC1155）
- 学习 DeFi 协议开发
- 掌握安全最佳实践
- 学习 Layer 2 解决方案
- 探索跨链开发

---

这个指南涵盖了 Solidity 的基础知识。建议结合实际项目练习，逐步掌握智能合约开发技能。