# moegirl-wiki-mcp-fix

萌娘百科 MCP 服务器修复版，提供萌娘百科搜索、页面获取和页面段落提取工具。

这个 fork 重点修复 OpenAI function calling / AstrBot 对 MCP 工具 schema 的兼容问题：`get_page` 和 `get_page_sections` 不再在 `inputSchema` 顶层使用 `oneOf`，避免出现类似错误：

```text
Invalid schema for function 'get_page': schema must have type 'object' and not have 'oneOf'/'anyOf'/'allOf'/'enum'/'not' at the top level.
```

## Features

- `search_moegirl` - 搜索萌娘百科条目
- `get_page` - 获取页面内容，并自动生成目录
- `get_page_sections` - 按标题或模板名称提取页面指定内容
- 内存缓存，减少重复请求
- TypeScript 实现，支持 MCP stdio server

## Requirements

- Node.js 18+
- npm
- 可以访问 `https://zh.moegirl.org.cn`

## Install

发布到 npm 后可以直接使用：

```bash
npx moegirl-wiki-mcp-fix
```

或全局安装：

```bash
npm install -g moegirl-wiki-mcp-fix
moegirl-wiki-mcp-fix
```

从 GitHub 本机运行：

```bash
git clone https://github.com/<your-name>/moegirl-wiki-mcp-fix.git
cd moegirl-wiki-mcp-fix
npm install
npm run build
npm run mcp
```

## AstrBot Configuration

如果已经发布到 npm：

```json
{
  "mcpServers": {
    "moegirl-wiki": {
      "command": "npx",
      "args": ["-y", "moegirl-wiki-mcp-fix"]
    }
  }
}
```

如果还没有发布到 npm，可以直接指向本机编译后的文件：

```json
{
  "mcpServers": {
    "moegirl-wiki": {
      "command": "node",
      "args": ["C:\\myspace\\moegirl-wiki-mcp-fix\\dist\\mcp.js"]
    }
  }
}
```

如果 AstrBot 跑在 Docker/Linux 容器里，请使用容器内路径：

```json
{
  "mcpServers": {
    "moegirl-wiki": {
      "command": "node",
      "args": ["/app/mcp/moegirl-wiki-mcp-fix/dist/mcp.js"]
    }
  }
}
```

注意：不要使用 `npx moegirl-wiki-mcp@latest`，那会下载原始 npm 包，可能仍然触发 schema 兼容错误。

## Claude Desktop Configuration

在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "moegirl-wiki": {
      "command": "npx",
      "args": ["-y", "moegirl-wiki-mcp-fix"],
      "alwaysAllow": ["search_moegirl", "get_page", "get_page_sections"]
    }
  }
}
```

本机开发版：

```json
{
  "mcpServers": {
    "moegirl-wiki": {
      "command": "node",
      "args": ["/absolute/path/to/moegirl-wiki-mcp-fix/dist/mcp.js"],
      "alwaysAllow": ["search_moegirl", "get_page", "get_page_sections"]
    }
  }
}
```

## Tool Arguments

### search_moegirl

```json
{
  "keyword": "芙宁娜",
  "limit": 5
}
```

### get_page

```json
{
  "title": "芙宁娜",
  "clean_content": true,
  "max_length": 2000
}
```

也可以使用 `pageid`：

```json
{
  "pageid": 12345,
  "max_length": 5000
}
```

### get_page_sections

```json
{
  "title": "芙宁娜",
  "section_titles": ["命之座", "天赋"],
  "max_length": 5000
}
```

也可以按模板名称提取：

```json
{
  "title": "原神",
  "template_names": ["原神角色"]
}
```

## Development

```bash
npm install
npm run build
npm test
```

常用脚本：

- `npm run build` - 编译 TypeScript 到 `dist/`
- `npm run mcp` - 启动 MCP stdio server
- `npm start` - 启动 CLI
- `npm test` - 运行 schema 兼容性回归测试
- `npm run smoke:search` - 使用 CLI 搜索萌娘百科，依赖外部网络和萌娘百科 API

## Publish to npm

发布前请确认：

```bash
npm install
npm run build
npm test
npm pack --dry-run
```

登录并发布：

```bash
npm login
npm publish
```

如果 npm 提示名称已被占用，请修改 `package.json` 里的 `name` 后再发布。

## Project Structure

```text
src-ts/
  core/      # 萌娘百科 API 客户端、缓存、解析与清理逻辑
  mcp/       # MCP server 和工具定义
  cli/       # 命令行工具
  types/     # TypeScript 类型定义
tests/       # 回归测试
dist/        # 编译输出
```

## Notice

- 本项目仅限非商业用途使用。
- 禁止高频请求，避免给萌娘百科服务器造成压力。
- 请遵守萌娘百科服务条款。
- 内容缓存用于减少重复请求。

## License

GPL-3.0 License
