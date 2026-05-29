/**
 * Wiki文本清理工具
 * 基于Angel Eye插件的实现，清理MediaWiki标记但保留核心内容结构
 */
export class WikiTextCleaner {
    /**
     * 清理Wiki文本，移除视觉噪音但保留核心数据结构
     * @param wikitext 原始Wiki文本
     * @returns 清理和标准化后的文本
     */
    static clean(wikitext) {
        if (!wikitext) {
            return '';
        }
        let cleaned = wikitext;
        // 1. 移除纯视觉HTML标签（保留内容）
        cleaned = cleaned.replace(/<\/? (poem|del|big|small|u)[^>]*>/gi, '');
        // <br/> 标签替换为换行符
        cleaned = cleaned.replace(/<br\s*\/?/gi, '\n');
        // <div> 标签移除
        cleaned = cleaned.replace(/<\/?div[^>]*>/gi, '');
        // 2. 移除页面级功能性模板
        const pageLevelTemplates = [
            /\{\{(原神TOP|背景图片|注释|references\/|玩梗适度)(\|[^}]*)?\}\}/gi
        ];
        pageLevelTemplates.forEach(pattern => {
            cleaned = cleaned.replace(pattern, '');
        });
        // 3. 移除脚注
        cleaned = cleaned.replace(/<ref[^>]*>.*?<\/ref>/gs, '');
        // 4. 移除/展开内联样式模板（保留内容）
        // {{color|...|text}} -> text
        cleaned = cleaned.replace(/\{\{(?:color|genshincolor)\|[^|}]+?\|([^}]+?)\}\}/gi, '$1');
        // {{ruby|text|pronunciation}} -> text(pronunciation)
        cleaned = cleaned.replace(/\{\{ruby\|([^|]+)\|([^}]+)\}\}/gi, '$1($2)');
        // 5. 标准化数据分隔符
        cleaned = cleaned.replace(/\{\{!!\}\}/g, ', ');
        // 6. 简化文件和外部链接
        // [[File:...]] -> [图片: filename]
        cleaned = cleaned.replace(/\[\[File:([^|\]]+).*?\]\]/gi, '[图片: $1]');
        // {{BilibiliVideo|id=...}} -> [Bilibili视频: URL]
        cleaned = cleaned.replace(/\{\{BilibiliVideo\|id=(.*?)\}\}/gi, '[Bilibili视频: https://www.bilibili.com/video/$1]');
        // 7. 基础语法转换
        // '''粗体''' -> **粗体**
        cleaned = cleaned.replace(/'''(.*?)'''/g, '**$1**');
        // ''斜体'' -> *斜体*
        cleaned = cleaned.replace(/''(.*?)''/g, '*$1*');
        // [[内部链接|链接文本]] -> [链接文本](内部链接)
        cleaned = cleaned.replace(/\[\[([^|\]]+?)\|([^\]]+?)\]\]/g, '[$2]($1)');
        // [[内部链接]] -> [内部链接](内部链接)
        cleaned = cleaned.replace(/\[\[([^\]]+?)\]\]/g, '[$1]($1)');
        // 标题转换
        cleaned = cleaned.replace(/^======\s*(.*?)\s*======\s*$/gm, '###### $1');
        cleaned = cleaned.replace(/^=====\s*(.*?)\s*=====\s*$/gm, '##### $1');
        cleaned = cleaned.replace(/^====\s*(.*?)\s*====\s*$/gm, '#### $1');
        cleaned = cleaned.replace(/^===\s*(.*?)\s*===\s*$/gm, '### $1');
        cleaned = cleaned.replace(/^==\s*(.*?)\s*==\s*$/gm, '## $1');
        cleaned = cleaned.replace(/^=\s*(.*?)\s*=\s*$/gm, '# $1');
        // 小节标题
        cleaned = cleaned.replace(/^;\s*(.*?)\s*$/gm, '**$1**');
        // 外部链接
        cleaned = cleaned.replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+?)]/g, '[$2]($1)');
        cleaned = cleaned.replace(/\[(https?:\/\/[^\s\]]+)]/g, '$1');
        // <del>删除线</del> -> ~~删除线~~
        cleaned = cleaned.replace(/<del>(.*?)<\/del>/g, '~~$1~~');
        // 8. 最终清理
        // 合并多个换行符
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        // 移除首尾空白
        cleaned = cleaned.trim();
        return cleaned;
    }
    /**
     * 提取摘要文本（前N个字符）
     * @param wikitext 原始Wiki文本
     * @param maxLength 最大长度，默认500字符
     * @returns 摘要文本
     */
    static extractSummary(wikitext, maxLength = 500) {
        const cleaned = this.clean(wikitext);
        if (cleaned.length <= maxLength) {
            return cleaned;
        }
        // 尝试在句子边界截断
        const truncated = cleaned.substring(0, maxLength);
        const lastSentenceEnd = Math.max(truncated.lastIndexOf('。'), truncated.lastIndexOf('！'), truncated.lastIndexOf('？'), truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'));
        if (lastSentenceEnd > maxLength * 0.7) {
            return truncated.substring(0, lastSentenceEnd + 1);
        }
        // 如果没有合适的句子边界，在空格处截断
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.8) {
            return truncated.substring(0, lastSpace) + '...';
        }
        return truncated + '...';
    }
    /**
     * 提取关键信息（标题、第一段等）
     * @param wikitext 原始Wiki文本
     * @returns 关键信息对象
     */
    static extractKeyInfo(wikitext) {
        const cleaned = this.clean(wikitext);
        const lines = cleaned.split('\n').filter(line => line.trim());
        const result = {};
        // 第一行通常作为标题
        if (lines.length > 0) {
            result.title = lines[0].trim();
        }
        // 第一段作为摘要
        const firstEmptyLineIndex = lines.findIndex(line => !line.trim());
        const firstParagraph = lines.slice(1, firstEmptyLineIndex > 0 ? firstEmptyLineIndex : 3).join(' ').trim();
        if (firstParagraph) {
            result.firstParagraph = firstParagraph;
        }
        // 提取章节标题（以数字开头的行可能是章节）
        const sections = lines.filter(line => /^\d+\./.test(line.trim()));
        if (sections.length > 0) {
            result.sections = sections.slice(0, 5); // 最多取5个章节
        }
        return result;
    }
    /**
     * 检查文本是否包含特定关键词
     * @param wikitext Wiki文本
     * @param keywords 关键词数组
     * @returns 匹配的关键词数组
     */
    static findKeywords(wikitext, keywords) {
        const cleaned = this.clean(wikitext).toLowerCase();
        return keywords.filter(keyword => cleaned.includes(keyword.toLowerCase()));
    }
    /**
     * 格式化输出文本（适合CLI显示）
     * @param title 标题
     * @param content 内容
     * @param maxLength 最大长度
     * @returns 格式化文本
     */
    static formatForDisplay(title, content, maxLength = 1000) {
        const cleaned = this.clean(content);
        const summary = this.extractSummary(cleaned, maxLength);
        let result = `📖 ${title}\n`;
        result += '='.repeat(title.length + 3) + '\n\n';
        result += summary;
        if (cleaned.length > maxLength) {
            result += `\n\n... (内容已截断，完整长度: ${cleaned.length} 字符)`;
        }
        return result;
    }
}
//# sourceMappingURL=wikitext_cleaner.js.map