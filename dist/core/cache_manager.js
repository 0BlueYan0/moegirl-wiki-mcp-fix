/**
 * 缓存管理器
 * 基于内存的简单缓存实现
 */
export class CacheManager {
    cache = new Map();
    stats = {
        total_entries: 0,
        cache_hits: 0,
        cache_misses: 0,
        hit_rate: 0
    };
    defaultTTL = 30 * 60 * 1000; // 30分钟默认过期时间
    /**
     * 生成搜索缓存键
     * @param keyword 搜索关键词
     * @param limit 结果数量限制
     * @returns 缓存键
     */
    static buildSearchKey(keyword, limit = 5) {
        return `search:${keyword}:${limit}`;
    }
    /**
     * 生成文档缓存键
     * @param pageid 页面ID或标题
     * @returns 缓存键
     */
    static buildDocKey(pageid) {
        return `doc:${pageid}`;
    }
    /**
     * 设置缓存项
     * @param key 缓存键
     * @param data 数据
     * @param ttl 过期时间（毫秒），默认使用默认TTL
     */
    set(key, data, ttl) {
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        };
        this.cache.set(key, entry);
        this.updateStats();
    }
    /**
     * 获取缓存项
     * @param key 缓存键
     * @returns 缓存的数据，如果不存在或已过期则返回null
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.cache_misses++;
            this.updateStats();
            return null;
        }
        // 检查是否过期
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.stats.cache_misses++;
            this.updateStats();
            return null;
        }
        this.stats.cache_hits++;
        this.updateStats();
        return entry.data;
    }
    /**
     * 删除缓存项
     * @param key 缓存键
     * @returns 是否删除成功
     */
    delete(key) {
        const result = this.cache.delete(key);
        this.updateStats();
        return result;
    }
    /**
     * 清空所有缓存
     */
    clear() {
        this.cache.clear();
        this.stats = {
            total_entries: 0,
            cache_hits: 0,
            cache_misses: 0,
            hit_rate: 0
        };
    }
    /**
     * 清理过期缓存项
     * @returns 清理的项数
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }
        this.updateStats();
        return cleanedCount;
    }
    /**
     * 获取缓存统计信息
     * @returns 缓存统计
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * 更新统计信息
     */
    updateStats() {
        this.stats.total_entries = this.cache.size;
        const totalRequests = this.stats.cache_hits + this.stats.cache_misses;
        this.stats.hit_rate = totalRequests > 0 ? this.stats.cache_hits / totalRequests : 0;
    }
    /**
     * 获取所有缓存键
     * @returns 缓存键数组
     */
    keys() {
        return Array.from(this.cache.keys());
    }
    /**
     * 检查缓存项是否存在且未过期
     * @param key 缓存键
     * @returns 是否存在有效缓存
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        // 检查是否过期
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.updateStats();
            return false;
        }
        return true;
    }
    /**
     * 获取缓存项的剩余生存时间（毫秒）
     * @param key 缓存键
     * @returns 剩余时间，如果不存在或已过期则返回0
     */
    getTTL(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return 0;
        }
        const elapsed = Date.now() - entry.timestamp;
        const remaining = entry.ttl - elapsed;
        return remaining > 0 ? remaining : 0;
    }
    /**
     * 设置默认TTL
     * @param ttl 默认过期时间（毫秒）
     */
    setDefaultTTL(ttl) {
        this.defaultTTL = ttl;
    }
    /**
     * 获取缓存大小（项数）
     * @returns 缓存项数
     */
    size() {
        return this.cache.size;
    }
    /**
     * 打印缓存状态（用于调试）
     */
    printStatus() {
        console.log('📊 缓存状态:');
        console.log(`   总条目数: ${this.stats.total_entries}`);
        console.log(`   缓存命中: ${this.stats.cache_hits}`);
        console.log(`   缓存未命中: ${this.stats.cache_misses}`);
        console.log(`   命中率: ${(this.stats.hit_rate * 100).toFixed(2)}%`);
        console.log(`   内存使用: ${this.cache.size} 项`);
    }
}
//# sourceMappingURL=cache_manager.js.map