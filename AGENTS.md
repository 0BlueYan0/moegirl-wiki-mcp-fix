# 萌娘百科 MCP 服务器 - 项目上手指引

## 项目概述

这是一个基于 Model Context Protocol (MCP) 的萌娘百科专用服务器，提供搜索、页面获取和内容解析功能。项目采用 TypeScript 开发，专门用于访问萌娘百科的 ACG、二次元、动漫、游戏相关内容。

## 核心架构设计

### 1. 分层架构模式

项目采用清晰的分层架构，从上到下分为：

```
┌─────────────────────────────────────────────────────────────┐
│                    接口层 (Interface Layer)                  │
├─────────────────────────────────────────────────────────────┤
│  MCP服务器 (src-ts/mcp/server.ts)                           │
│  CLI工具 (src-ts/cli/commands.ts)                           │
├─────────────────────────────────────────────────────────────┤
│                    业务逻辑层 (Business Layer)               │
├─────────────────────────────────────────────────────────────┤
│  萌娘百科客户端 (src-ts/core/moegirl_client.ts)             │
│  页面内容解析器 (src-ts/core/page_content_parser.ts)        │
│  Wiki文本清理器 (src-ts/core/wikitext_cleaner.ts)           │
├─────────────────────────────────────────────────────────────┤
│                    基础设施层 (Infrastructure Layer)          │
├─────────────────────────────────────────────────────────────┤
│  缓存管理器 (src-ts/core/cache_manager.ts)                   │
│  类型定义 (src-ts/types/index.ts)                           │
└─────────────────────────────────────────────────────────────┘
```

### 2. 核心设计模式

#### 2.1 适配器模式
- [`MoegirlClient`](src-ts/core/moegirl_client.ts:9) 作为萌娘百科 API 的适配器，将 MediaWiki API 转换为内部统一接口
- 封装了 HTTP 请求细节，提供简洁的 `search()` 和 `getPageContent()` 方法

#### 2.2 策略模式
- [`WikiTextCleaner`](src-ts/core/wikitext_cleaner.ts:6) 实现多种文本清理策略
- 支持不同的内容格式化方式，可根据需求选择清理程度

#### 2.3 缓存模式
- [`CacheManager`](src-ts/core/cache_manager.ts:14) 实现基于 TTL 的内存缓存
- 采用静态方法构建缓存键，确保键值一致性
- 支持缓存统计和自动过期清理

#### 2.4 解析器模式
- [`PageContentParser`](src-ts/core/page_content_parser.ts:8) 专门解析 Wiki 页面结构
- 将复杂的 Wiki 标记解析为结构化的 `PageStructure` 对象
- 支持标题、模板和内容的分离提取

### 3. 数据流与控制流

#### 3.1 MCP 服务器数据流
```
Claude Desktop → MCP Server → Tool Router → Business Logic → Cache → External API
     ↑              ↑             ↑              ↑            ↑          ↑
  Response     Format Tool   Handle Tool   Process Data   Check Cache  HTTP Request
```

#### 3.2 CLI 工具数据流
```
CLI Command → Command Handler → Business Logic → Cache → External API
     ↑              ↑             ↑              ↑            ↑
  Display     Parse Options   Process Data   Check Cache  HTTP Request
```

## 场景化导航

### 1. 新增业务逻辑

**场景**: 需要添加新的萌娘百科功能，如获取页面历史版本

**切入文件**:
1. [`src-ts/types/index.ts`](src-ts/types/index.ts:1) - 添加新的类型定义
2. [`src-ts/core/moegirl_client.ts`](src-ts/core/moegirl_client.ts:9) - 在 `MoegirlClient` 类中添加新方法
3. [`src-ts/mcp/server.ts`](src-ts/mcp/server.ts:24) - 在 `getToolList()` 中注册新工具，在 `handleToolCall()` 中添加处理逻辑
4. [`src-ts/cli/commands.ts`](src-ts/cli/commands.ts:13) - 在 CLI 中添加对应命令

**实现模式**:
```typescript
// 1. 类型定义
export interface PageHistoryParams {
  pageid?: number;
  title?: string;
  limit?: number;
}

// 2. 客户端方法
async getPageHistory(params: PageHistoryParams): Promise<PageHistory[]> {
  // 实现API调用逻辑
}

// 3. MCP工具注册
{
  name: 'get_page_history',
  description: '获取页面历史版本',
  inputSchema: { /* 参数定义 */ }
}

// 4. 工具处理
case 'get_page_history':
  return await this.handleGetPageHistory(args);
```

### 2. 修改数据定义

**场景**: 需要扩展搜索结果或页面内容的数据结构

**切入文件**:
1. [`src-ts/types/index.ts`](src-ts/types/index.ts:1) - 修改接口定义
2. [`src-ts/core/moegirl_client.ts`](src-ts/core/moegirl_client.ts:9) - 更新数据映射逻辑
3. [`src-ts/core/page_content_parser.ts`](src-ts/core/page_content_parser.ts:8) - 如需解析新字段

**注意事项**:
- 确保向后兼容性，可选字段使用 `?` 标记
- 更新相关的类型转换和映射逻辑
- 考虑缓存键的影响，必要时更新缓存策略

### 3. 配置环境

**场景**: 需要修改API端点、缓存策略或其他配置

**切入文件**:
1. [`src-ts/core/moegirl_client.ts`](src-ts/core/moegirl_client.ts:11) - 修改 `apiEndpoint` 常量
2. [`src-ts/core/cache_manager.ts`](src-ts/core/cache_manager.ts:22) - 调整 `defaultTTL` 值
3. [`src-ts/mcp/server.ts`](src-ts/mcp/server.ts:31) - 修改服务器初始化参数

**配置模式**:
```typescript
// 环境变量支持
private readonly apiEndpoint = process.env.MOEGIRL_API_ENDPOINT || 'https://zh.moegirl.org.cn/api.php';
private readonly defaultTTL = parseInt(process.env.CACHE_TTL || '1800000'); // 30分钟
```

## 关键技术栈

### 1. 核心依赖
- **@modelcontextprotocol/sdk**: MCP 协议实现，提供服务器和工具的基础框架
- **axios**: HTTP 客户端，用于与萌娘百科 API 通信
- **commander**: CLI 框架，用于构建命令行界面

### 2. 开发工具链
- **TypeScript**: 主要开发语言，提供类型安全
- **ES2022**: 目标运行时，支持现代 JavaScript 特性
- **ESNext**: 模块系统，支持 tree-shaking

### 3. 架构决策记录

#### 3.1 为什么选择 MCP 协议？
- **标准化**: MCP 提供了 AI 助手与工具交互的标准协议
- **生态兼容**: 与 Claude Desktop 等 AI 工具无缝集成
- **工具发现**: 自动工具发现和描述机制

#### 3.2 为什么使用内存缓存？
- **性能**: 避免重复的网络请求，提高响应速度
- **简单**: 无需外部依赖，部署简单
- **足够**: 对于个人使用场景，内存缓存已足够

#### 3.3 为什么分离解析和清理逻辑？
- **职责单一**: 解析器专注于结构提取，清理器专注于内容净化
- **可复用**: 解析结果可用于多种场景，不限于清理
- **可测试**: 各组件可独立测试，提高代码质量

## 开发最佳实践

### 1. 错误处理
- 使用统一的错误处理模式，参考 [`MoegirlMCPServer.setupErrorHandling()`](src-ts/mcp/server.ts:63)
- API 调用失败时提供详细的错误信息和可能的解决方案
- 使用 try-catch 包装所有异步操作

### 2. 缓存策略
- 所有 API 调用结果都应考虑缓存
- 使用静态方法构建缓存键，确保一致性
- 定期清理过期缓存，避免内存泄漏

### 3. 类型安全
- 严格使用 TypeScript 类型定义
- 避免使用 `any` 类型，优先使用具体类型或泛型
- 为所有公共方法提供完整的 JSDoc 注释

### 4. 代码组织
- 按功能模块组织代码，保持单一职责原则
- 使用依赖注入模式，便于测试和扩展
- 保持一致的命名约定和代码风格

## 常见开发任务

### 1. 添加新的 MCP 工具
```typescript
// 1. 在 getToolList() 中添加工具定义
{
  name: 'new_tool',
  description: '工具描述',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '参数描述' }
    },
    required: ['param1']
  }
}

// 2. 在 handleToolCall() 中添加处理逻辑
case 'new_tool':
  return await this.handleNewTool(args);

// 3. 实现处理方法
private async handleNewTool(args: any): Promise<MCPToolResponse> {
  // 实现逻辑
}
```

### 2. 扩展 CLI 命令
```typescript
// 1. 在 registerCommands() 中注册命令
program
  .command('new-command')
  .description('命令描述')
  .argument('<arg>', '参数描述')
  .option('-o, --option <value>', '选项描述')
  .action(async (arg, options) => {
    await this.handleNewCommand(arg, options);
  });

// 2. 实现处理方法
private async handleNewCommand(arg: string, options: any): Promise<void> {
  // 实现逻辑
}
```

### 3. 修改缓存策略
```typescript
// 1. 修改默认 TTL
private defaultTTL = 60 * 60 * 1000; // 1小时

// 2. 添加自定义缓存键构建方法
static buildCustomKey(param1: string, param2: number): string {
  return `custom:${param1}:${param2}`;
}

// 3. 在业务逻辑中使用缓存
const cacheKey = CacheManager.buildCustomKey(param1, param2);
const cachedResult = this.cache.get(cacheKey);
if (cachedResult) {
  return cachedResult;
}
// 执行业务逻辑
this.cache.set(cacheKey, result);
```

## 测试与调试

### 1. 本地测试
```bash
# 构建项目
npm run build

# 测试 CLI 功能
npm start search 芙宁娜

# 测试 MCP 服务器
npm run mcp
```

### 2. 调试技巧
- 使用 `console.log` 输出关键信息，已在前代码中广泛使用
- 检查缓存状态：`npm start cache-stats`
- 测试 API 连接：`npm start test`

### 3. 常见问题排查

#### 3.1 socket hang up / ECONNRESET 错误
**症状**:
```
❌ [MoegirlClient] 搜索失败: AxiosError: socket hang up
code: 'ECONNRESET'
```

**根本原因**:
- axios 的默认配置与萌娘百科服务器不兼容
- User-Agent 可能被服务器拒绝
- HTTP 请求头配置不当

**解决方案**:
1. 使用标准浏览器 User-Agent
2. 简化请求头配置，只保留必要项
3. 增加超时时间（30秒以上）

**实际修复代码**（参考 [`src-ts/core/moegirl_client.ts:14`](src-ts/core/moegirl_client.ts:14)）:
```typescript
this.api = axios.create({
  baseURL: this.apiEndpoint,
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': '*/*'
  }
});
```

**验证方法**:
```bash
# 构建并测试
npm run build && npm start search 初音未来

# 应该看到成功的搜索结果
✅ [MoegirlClient] 搜索完成，找到 5 个结果
```

#### 3.2 其他常见问题
- **API 连接失败**: 检查网络连接和萌娘百科服务状态
- **缓存问题**: 使用 `cache-clear` 命令清理缓存
- **解析错误**: 检查 Wiki 标记格式，可能需要更新解析逻辑

## 部署与发布

### 1. 构建流程
```bash
# 清理旧构建
npm run clean

# 编译 TypeScript
npm run build

# 检查构建结果
ls -la dist/
```

### 2. 发布准备
- 更新 [`package.json`](package.json:3) 中的版本号
- 确保所有更改已提交到 Git
- 运行完整测试确保功能正常

### 3. MCP 服务器配置
在 Claude Desktop 的配置文件中添加：
```json
{
  "mcpServers": {
    "moegirl_wiki_mcp": {
      "command": "npx",
      "args": ["-y", "moegirl-wiki-mcp"],
      "alwaysAllow": ["search_moegirl", "get_page", "get_page_sections"]
    }
  }
}
```

## 总结

萌娘百科 MCP 服务器采用清晰的分层架构，通过适配器模式、策略模式等设计模式，实现了高度模块化和可扩展的代码结构。项目专注于提供高效的萌娘百科内容访问能力，通过缓存机制和智能解析，为 AI 助手提供了强大的知识获取工具。

开发者在接手项目时，应重点关注：
1. 理解分层架构和数据流
2. 掌握各种设计模式的应用
3. 熟悉缓存和解析机制
4. 遵循类型安全和错误处理最佳实践

通过本指引，开发者应能快速理解项目结构，定位关键代码，并高效地进行功能扩展和维护工作。