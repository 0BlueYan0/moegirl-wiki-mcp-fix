/**
 * 萌娘百科API客户端
 * 基于Angel Eye插件的Python实现移植到TypeScript
 */
import { MoegirlSearchResult, MoegirlPageContent, SearchParams, PageParams } from '../types/index.js';
export declare class MoegirlClient {
    private api;
    private readonly apiEndpoint;
    private readonly siteName;
    constructor();
    /**
     * 根据关键词搜索萌娘百科
     * @param params 搜索参数
     * @returns 搜索结果列表
     */
    search(params: SearchParams): Promise<MoegirlSearchResult[]>;
    /**
     * 根据页面ID获取页面内容
     * @param params 页面参数
     * @returns 页面内容
     */
    getPageContent(params: PageParams): Promise<MoegirlPageContent | null>;
    /**
     * 根据页面ID获取完整页面信息（包含搜索结果信息）
     * @param pageid 页面ID
     * @returns 完整页面信息
     */
    getFullPageInfo(pageid: number): Promise<(MoegirlSearchResult & MoegirlPageContent) | null>;
    /**
     * 检查API连接状态
     * @returns 连接状态
     */
    checkConnection(): Promise<boolean>;
    /**
     * 延迟函数
     * @param ms 延迟毫秒数
     */
    private sleep;
}
//# sourceMappingURL=moegirl_client.d.ts.map