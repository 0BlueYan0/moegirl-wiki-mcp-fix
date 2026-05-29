/**
 * 萌娘百科 MCP 服务器
 * 使用官方 MCP SDK 实现
 */
export declare class MoegirlMCPServer {
    private server;
    private client;
    private cache;
    private isInitialized;
    private stats;
    constructor();
    /**
     * 设置错误处理
     */
    private setupErrorHandling;
    /**
     * 设置请求处理器
     */
    private setupHandlers;
    /**
     * 获取工具列表
     */
    private getToolList;
    /**
     * 处理工具调用
     */
    private handleToolCall;
    /**
     * 处理搜索萌娘百科
     */
    private handleSearchMoegirl;
    /**
     * 处理获取页面
     */
    private handleGetPage;
    /**
     * 处理获取页面段落
     */
    private handleGetPageSections;
    /**
     * 格式化页面结构
     */
    private formatPageStructure;
    /**
     * 格式化页面内容（包含目录）
     */
    private formatPageContentWithTOC;
    /**
     * 格式化搜索结果
     */
    private formatSearchResults;
    /**
     * 格式化页面内容
     */
    private formatPageContent;
    /**
     * 创建错误响应
     */
    private createErrorResponse;
    /**
     * 获取资源列表
     */
    private getResourceList;
    /**
     * 处理资源读取
     */
    private handleResourceRead;
    /**
     * 获取搜索帮助文本
     */
    private getSearchHelpText;
    /**
     * 获取页面帮助文本
     */
    private getPageHelpText;
    /**
     * 获取页面段落帮助文本
     */
    private getSectionsHelpText;
    /**
     * 启动MCP服务器
     */
    start(): Promise<void>;
    /**
     * 关闭MCP服务器
     */
    close(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map