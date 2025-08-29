# 以太坊代币标准（ERC）详解

以太坊请求评论（Ethereum Request for Comments，简称 ERC）是以太坊开发社区制定的技术标准，用于规范智能合约的行为和接口。本文将详细介绍三个最常用的代币标准：ERC20、ERC721 和 ERC1155。

## 目录
1. [ERC20 - 同质化代币标准](#erc20---同质化代币标准)
2. [ERC721 - 非同质化代币标准](#erc721---非同质化代币标准)
3. [ERC1155 - 多代币标准](#erc1155---多代币标准)
4. [标准对比](#标准对比)
5. [实现最佳实践](#实现最佳实践)

## ERC20 - 同质化代币标准

ERC20 是以太坊上最广泛使用的代币标准，用于创建可互换（同质化）的代币。同质化意味着每个代币单位都是相同的，就像法定货币一样。

### 核心特性
- **可替代性**：每个代币单位完全相同且可互换
- **可分割性**：可以分割为小数部分（通常最多 18 位小数）
- **标准化接口**：所有 ERC20 代币共享相同的函数接口

### 标准接口

```solidity
interface IERC20 {
    // 事件
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // 查询函数
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    
    // 状态修改函数
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    // 可选的元数据函数
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}
```

### 核心功能解析

1. **totalSupply()**：返回代币的总供应量
2. **balanceOf(address)**：返回指定地址的代币余额
3. **transfer(address, uint256)**：将代币从调用者地址转移到指定地址
4. **approve(address, uint256)**：允许指定地址从调用者账户中提取代币
5. **allowance(address, address)**：返回代币所有者允许支出者使用的代币数量
6. **transferFrom(address, address, uint256)**：由已获批准的地址代表代币所有者转移代币

### 应用场景
- 加密货币
- 公司股份代币化
- 忠诚度积分系统
- 投票权代币
- 稳定币

### 简单实现示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = initialSupply * 10**uint256(_decimals);
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
}
```

### ERC20 的局限性
- 不支持批量转账，每次只能转移一种代币
- 不能直接处理非同质化资产
- 代币误发送到合约地址可能导致永久丢失

## ERC721 - 非同质化代币标准

ERC721 是用于非同质化代币（NFT）的标准。每个代币都是唯一的，具有不同的价值和属性，类似于收藏品或艺术品。

### 核心特性
- **唯一性**：每个代币都有唯一的 ID 和属性
- **不可分割**：代币不能被分割，只能作为整体转移
- **元数据支持**：可以关联外部数据（如图像、视频等）

### 标准接口

```solidity
interface IERC721 {
    // 事件
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    // 查询函数
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    
    // 状态修改函数
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    
    // 元数据接口（可选）
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

// 接收者接口
interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}
```

### 核心功能解析

1. **balanceOf(address)**：返回指定地址拥有的代币数量
2. **ownerOf(uint256)**：返回特定代币 ID 的所有者
3. **approve(address, uint256)**：授权指定地址转移特定代币
4. **getApproved(uint256)**：查询被授权转移特定代币的地址
5. **setApprovalForAll(address, bool)**：授权或撤销操作者管理调用者所有代币的权限
6. **isApprovedForAll(address, address)**：查询操作者是否被所有者授权
7. **transferFrom(address, address, uint256)**：转移代币所有权
8. **safeTransferFrom()**：安全转移代币，确保接收者能够处理 ERC721 代币

### 应用场景
- 数字艺术品和收藏品
- 游戏内资产
- 虚拟土地和房产
- 身份和证书
- 实物资产的数字化表示

### 简单实现示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleERC721 {
    string public name;
    string public symbol;
    
    // 代币ID到所有者地址的映射
    mapping(uint256 => address) private _owners;
    // 所有者地址到其拥有的代币数量的映射
    mapping(address => uint256) private _balances;
    // 代币ID到被批准地址的映射
    mapping(uint256 => address) private _tokenApprovals;
    // 所有者地址到操作者地址的批准映射
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // 代币ID到URI的映射
    mapping(uint256 => string) private _tokenURIs;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Balance query for zero address");
        return _balances[owner];
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Owner query for nonexistent token");
        return owner;
    }
    
    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(to != owner, "Approval to current owner");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "Not token owner or approved operator");
            
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "Approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        _transfer(from, to, tokenId);
        
        // 检查接收者是否实现了 onERC721Received
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, _data) returns (bytes4 retval) {
                require(retval == IERC721Receiver.onERC721Received.selector, "Receiver not implemented");
            } catch {
                revert("Transfer to non ERC721Receiver implementer");
            }
        }
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Not owner");
        require(to != address(0), "Transfer to zero address");
        
        // 清除之前的批准
        _tokenApprovals[tokenId] = address(0);
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    // 铸造新代币
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero address");
        require(_owners[tokenId] == address(0), "Token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    // 设置代币URI
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_owners[tokenId] != address(0), "URI set for nonexistent token");
        _tokenURIs[tokenId] = uri;
    }
    
    // 获取代币URI
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
}
```

### ERC721 的局限性
- 每次只能转移一个 NFT，批量操作效率低
- 管理大量 NFT 时 Gas 成本高
- 不能同时处理同质化和非同质化代币

## ERC1155 - 多代币标准

ERC1155 是一个统一的标准，允许在单个合约中创建和管理同质化代币和非同质化代币。它解决了 ERC20 和 ERC721 的一些局限性。

### 核心特性
- **多代币支持**：一个合约可以管理多种代币类型
- **批量操作**：支持在一次交易中转移多个代币
- **Gas 优化**：比分别使用 ERC20 和 ERC721 更高效
- **半同质化支持**：可以创建有限数量的相同代币

### 标准接口

```solidity
interface IERC1155 {
    // 事件
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);
    
    // 查询函数
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    
    // 状态修改函数
    function setApprovalForAll(address operator, bool approved) external;
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external;
    
    // 元数据
    function uri(uint256 id) external view returns (string memory);
}

// 接收者接口
interface IERC1155Receiver {
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4);
    
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4);
}
```

### 核心功能解析

1. **balanceOf(address, uint256)**：返回账户拥有的特定 ID 代币数量
2. **balanceOfBatch(address[], uint256[])**：批量查询多个账户的多个代币余额
3. **setApprovalForAll(address, bool)**：授权或撤销操作者管理调用者所有代币的权限
4. **isApprovedForAll(address, address)**：查询操作者是否被所有者授权
5. **safeTransferFrom(address, address, uint256, uint256, bytes)**：安全转移特定数量的代币
6. **safeBatchTransferFrom(address, address, uint256[], uint256[], bytes)**：批量安全转移多种代币

### 应用场景
- 游戏内多种资产（装备、道具、角色）
- 混合型 DeFi 应用
- 交易卡游戏
- 需要同时管理同质化和非同质化资产的应用
- 需要批量操作的应用

### 简单实现示例

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleERC1155 {
    // 代币ID和账户到余额的映射
    mapping(uint256 => mapping(address => uint256)) private _balances;
    // 所有者到操作者的批准映射
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    // 代币ID到URI的映射
    mapping(uint256 => string) private _uris;
    
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);
    
    function balanceOf(address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "Balance query for zero address");
        return _balances[id][account];
    }
    
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids) public view returns (uint256[] memory) {
        require(accounts.length == ids.length, "Accounts and ids length mismatch");
        
        uint256[] memory batchBalances = new uint256[](accounts.length);
        
        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }
        
        return batchBalances;
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Setting approval for self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not owner or approved"
        );
        require(to != address(0), "Transfer to zero address");
        
        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "Insufficient balance");
        
        _balances[id][from] = fromBalance - amount;
        _balances[id][to] += amount;
        
        emit TransferSingle(msg.sender, from, to, id, amount);
        
        _doSafeTransferAcceptanceCheck(msg.sender, from, to, id, amount, data);
    }
    
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not owner or approved"
        );
        require(to != address(0), "Transfer to zero address");
        require(ids.length == amounts.length, "Ids and amounts length mismatch");
        
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];
            
            uint256 fromBalance = _balances[id][from];
            require(fromBalance >= amount, "Insufficient balance");
            
            _balances[id][from] = fromBalance - amount;
            _balances[id][to] += amount;
        }
        
        emit TransferBatch(msg.sender, from, to, ids, amounts);
        
        _doSafeBatchTransferAcceptanceCheck(msg.sender, from, to, ids, amounts, data);
    }
    
    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155Received.selector) {
                    revert("ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("Transfer to non ERC1155Receiver implementer");
            }
        }
    }
    
    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, amounts, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
                    revert("ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("Transfer to non ERC1155Receiver implementer");
            }
        }
    }
    
    // 铸造代币
    function _mint(address to, uint256 id, uint256 amount, bytes memory data) internal {
        require(to != address(0), "Mint to zero address");
        
        _balances[id][to] += amount;
        
        emit TransferSingle(msg.sender, address(0), to, id, amount);
        
        _doSafeTransferAcceptanceCheck(msg.sender, address(0), to, id, amount, data);
    }
    
    // 批量铸造代币
    function _mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) internal {
        require(to != address(0), "Mint to zero address");
        require(ids.length == amounts.length, "Ids and amounts length mismatch");
        
        for (uint256 i = 0; i < ids.length; ++i) {
            _balances[ids[i]][to] += amounts[i];
        }
        
        emit TransferBatch(msg.sender, address(0), to, ids, amounts);
        
        _doSafeBatchTransferAcceptanceCheck(msg.sender, address(0), to, ids, amounts, data);
    }
    
    // 设置代币URI
    function _setURI(uint256 id, string memory tokenURI) internal {
        _uris[id] = tokenURI;
        emit URI(tokenURI, id);
    }
    
    // 获取代币URI
    function uri(uint256 id) public view returns (string memory) {
        return _uris[id];
    }
}
```

## 标准对比

| 特性 | ERC20 | ERC721 | ERC1155 |
|------|-------|--------|---------|
| 代币类型 | 同质化 | 非同质化 | 同质化和非同质化 |
| 可分割性 | 是 | 否 | 可配置 |
| 批量转账 | 否 | 否 | 是 |
| Gas 效率 | 中等 | 低 | 高 |
| 元数据支持 | 有限 | 完整 | 完整 |
| 复杂度 | 低 | 中等 | 高 |
| 应用场景 | 加密货币、代币 | 收藏品、艺术品 | 游戏资产、混合应用 |

## 实现最佳实践

### ERC20 最佳实践
1. **使用 SafeMath**：在 Solidity 0.8.0 之前，使用 SafeMath 库防止溢出
2. **实现 decimals()**：虽然是可选的，但大多数应用需要它
3. **考虑代币恢复机制**：添加机制以恢复发送到错误地址的代币
4. **实现代币锁定**：考虑添加代币锁定/解锁功能
5. **批准机制安全**：使用 increaseAllowance/decreaseAllowance 而非直接 approve

### ERC721 最佳实践
1. **使用 safeTransferFrom**：优先使用 safeTransferFrom 而非 transferFrom
2. **实现元数据标准**：遵循 ERC721Metadata 扩展
3. **考虑枚举扩展**：实现 ERC721Enumerable 以支持链上枚举
4. **存储元数据**：考虑使用 IPFS 等分布式存储系统存储元数据
5. **实现铸造和销毁功能**：添加 mint 和 burn 功能

### ERC1155 最佳实践
1. **批量操作优化**：设计合约时考虑批量操作的 Gas 优化
2. **元数据格式**：使用标准化的元数据格式，如 JSON Schema
3. **URI 模板**：使用 URI 模板而非为每个代币存储单独的 URI
4. **安全检查**：实现全面的安全检查，特别是批量操作
5. **考虑混合应用场景**：设计时考虑同质化和非同质化代币的混合使用场景

## 总结

以太坊代币标准为开发者提供了创建各种数字资产的框架。选择哪种标准取决于您的具体需求：

- **ERC20**：适用于创建同质化代币，如加密货币或投票权代币
- **ERC721**：适用于创建独特的非同质化代币，如数字艺术品或收藏品
- **ERC1155**：适用于需要同时管理多种代币类型的复杂应用，如游戏或混合型 DeFi 应用

随着以太坊生态系统的发展，这些标准也在不断演进，开发者应关注最新的标准更新和最佳实践。

---

## 参考资源

- [EIP-20: ERC-20 代币标准](https://eips.ethereum.org/EIPS/eip-20)
- [EIP-721: ERC-721 非同质化代币标准](https://eips.ethereum.org/EIPS/eip-721)
- [EIP-1155: ERC-1155 多代币标准](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenZeppelin 文档](https://docs.openzeppelin.com/contracts/)