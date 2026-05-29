/**
 * Wiki文本清理工具
 * 基于Angel Eye插件的实现，清理MediaWiki标记但保留核心内容结构
 */
export declare class WikiTextCleaner {
    /**
     * 清理Wiki文本，移除视觉噪音但保留核心数据结构
     * @param wikitext 原始Wiki文本
     * @returns 清理和标准化后的文本
     */
    static clean(wikitext: string): string;
    /**
     * 提取摘要文本（前N个字符）
     * @param wikitext 原始Wiki文本
     * @param maxLength 最大长度，默认500字符
     * @returns 摘要文本
     */
    static extractSummary(wikitext: string, maxLength?: number): string;
    /**
     * 提取关键信息（标题、第一段等）
     * @param wikitext 原始Wiki文本
     * @returns 关键信息对象
     */
    static extractKeyInfo(wikitext: string): {
        title?: string;
        firstParagraph?: string;
        sections?: string[];
        infobox?: string;
    };
    /**
     * 检查文本是否包含特定关键词
     * @param wikitext Wiki文本
     * @param keywords 关键词数组
     * @returns 匹配的关键词数组
     */
    static findKeywords(wikitext: string, keywords: string[]): string[];
    /**
     * 格式化输出文本（适合CLI显示）
     * @param title 标题
     * @param content 内容
     * @param maxLength 最大长度
     * @returns 格式化文本
     */
    static formatForDisplay(title: string, content: string, maxLength?: number): string;
}
//# sourceMappingURL=wikitext_cleaner.d.ts.map