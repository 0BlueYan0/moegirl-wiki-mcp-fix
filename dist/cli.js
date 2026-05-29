#!/usr/bin/env node
/**
 * 萌娘百科 CLI 主入口
 */
import { Command } from 'commander';
import { CLICommands } from './cli/commands.js';
async function main() {
    console.log('🐱 萌娘百科 CLI 工具');
    console.log('='.repeat(30));
    const program = new Command();
    const cli = new CLICommands();
    // 设置程序信息
    program
        .name('moegirl')
        .description('萌娘百科搜索和浏览工具')
        .version('0.1.0');
    // 注册所有命令
    cli.registerCommands(program);
    // 解析命令行参数
    try {
        await program.parseAsync(process.argv);
    }
    catch (error) {
        console.error('❌ 命令执行失败:', error);
        process.exit(1);
    }
}
// 运行主函数
main().catch(error => {
    console.error('❌ CLI 启动失败:', error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map