/**
 * 缓存管理器
 * 基于内存的简单缓存实现
 */
import { CacheStats } from '../types/index.js';
export declare class CacheManager {
    private cache;
    private stats;
    private defaultTTL;
    /**
     * 生成搜索缓存键
     * @param keyword 搜索关键词
     * @param limit 结果数量限制
     * @returns 缓存键
     */
    static buildSearchKey(keyword: string, limit?: number): string;
    /**
     * 生成文档缓存键
     * @param pageid 页面ID或标题
     * @returns 缓存键
     */
    static buildDocKey(pageid: number | string): string;
    /**
     * 设置缓存项
     * @param key 缓存键
     * @param data 数据
     * @param ttl 过期时间（毫秒），默认使用默认TTL
     */
    set<T>(key: string, data: T, ttl?: number): void;
    /**
     * 获取缓存项
     * @param key 缓存键
     * @returns 缓存的数据，如果不存在或已过期则返回null
     */
    get<T>(key: string): T | null;
    /**
     * 删除缓存项
     * @param key 缓存键
     * @returns 是否删除成功
     */
    delete(key: string): boolean;
    /**
     * 清空所有缓存
     */
    clear(): void;
    /**
     * 清理过期缓存项
     * @returns 清理的项数
     */
    cleanup(): number;
    /**
     * 获取缓存统计信息
     * @returns 缓存统计
     */
    getStats(): CacheStats;
    /**
     * 更新统计信息
     */
    private updateStats;
    /**
     * 获取所有缓存键
     * @returns 缓存键数组
     */
    keys(): string[];
    /**
     * 检查缓存项是否存在且未过期
     * @param key 缓存键
     * @returns 是否存在有效缓存
     */
    has(key: string): boolean;
    /**
     * 获取缓存项的剩余生存时间（毫秒）
     * @param key 缓存键
     * @returns 剩余时间，如果不存在或已过期则返回0
     */
    getTTL(key: string): number;
    /**
     * 设置默认TTL
     * @param ttl 默认过期时间（毫秒）
     */
    setDefaultTTL(ttl: number): void;
    /**
     * 获取缓存大小（项数）
     * @returns 缓存项数
     */
    size(): number;
    /**
     * 打印缓存状态（用于调试）
     */
    printStatus(): void;
}
//# sourceMappingURL=cache_manager.d.ts.map