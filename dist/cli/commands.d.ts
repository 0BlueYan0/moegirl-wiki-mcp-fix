/**
 * CLI 命令处理器
 * 实现命令行模式的各种功能
 */
import { Command } from 'commander';
export declare class CLICommands {
    private client;
    private cache;
    constructor();
    /**
     * 设置优雅关闭
     */
    private setupGracefulShutdown;
    /**
     * 注册所有命令
     */
    registerCommands(program: Command): void;
    /**
     * 处理搜索命令
     */
    private handleSearchCommand;
    /**
     * 处理页面获取命令
     */
    private handlePageCommand;
    /**
     * 处理缓存统计命令
     */
    private handleCacheStatsCommand;
    /**
     * 处理缓存清理命令
     */
    private handleCacheClearCommand;
    /**
     * 处理连接测试命令
     */
    private handleTestCommand;
    /**
     * 显示搜索结果
     */
    private displaySearchResults;
    /**
     * 显示页面内容
     */
    private displayPageContent;
    /**
     * 处理页面段落命令
     */
    private handleSectionCommand;
    /**
     * 显示页面段落
     */
    private displayPageSections;
}
//# sourceMappingURL=commands.d.ts.map