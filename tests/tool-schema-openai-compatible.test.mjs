import assert from 'node:assert/strict';
import { MoegirlMCPServer } from '../dist/mcp/server.js';

try {
  const forbiddenTopLevelKeywords = ['oneOf', 'anyOf', 'allOf', 'enum', 'not'];
  const server = new MoegirlMCPServer();
  const tools = server.getToolList();

  for (const tool of tools) {
    assert.equal(
      tool.inputSchema?.type,
      'object',
      `${tool.name} inputSchema must have top-level type object`
    );

    for (const keyword of forbiddenTopLevelKeywords) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(tool.inputSchema, keyword),
        false,
        `${tool.name} inputSchema must not use top-level ${keyword}`
      );
    }
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
