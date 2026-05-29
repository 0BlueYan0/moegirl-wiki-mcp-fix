/**
 * CLI 命令处理器
 * 实现命令行模式的各种功能
 */
import { MoegirlClient } from '../core/moegirl_client.js';
import { WikiTextCleaner } from '../core/wikitext_cleaner.js';
import { CacheManager } from '../core/cache_manager.js';
import { PageContentParser } from '../core/page_content_parser.js';
export class CLICommands {
    client;
    cache;
    constructor() {
        this.client = new MoegirlClient();
        this.cache = new CacheManager();
        this.setupGracefulShutdown();
    }
    /**
     * 设置优雅关闭
     */
    setupGracefulShutdown() {
        const shutdown = async () => {
            console.log('\n🔄 正在关闭萌娘百科 CLI...');
            process.exit(0);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    /**
     * 注册所有命令
     */
    registerCommands(program) {
        // 搜索命令
        program
            .command('search')
            .description('搜索萌娘百科条目')
            .argument('<keyword>', '搜索关键词')
            .option('-l, --limit <number>', '返回结果数量限制', '5')
            .option('-m, --mode <mode>', '搜索模式 (original|fuzzy)', 'original')
            .option('--json', '输出 JSON 格式')
            .option('--no-cache', '不使用缓存')
            .action(async (keyword, options) => {
            await this.handleSearchCommand(keyword, options);
        });
        // 页面获取命令
        program
            .command('page')
            .description('获取萌娘百科页面内容')
            .argument('<identifier>', '页面ID或标题')
            .option('--id', '将参数作为页面ID处理')
            .option('--no-clean', '不清理Wiki标记')
            .option('--json', '输出 JSON 格式')
            .option('--no-cache', '不使用缓存')
            .option('-l, --limit <number>', '最大返回字符数', '2000')
            .action(async (identifier, options) => {
            await this.handlePageCommand(identifier, options);
        });
        // 缓存统计命令
        program
            .command('cache-stats')
            .description('查看缓存统计信息')
            .option('--json', '输出 JSON 格式')
            .action(async (options) => {
            await this.handleCacheStatsCommand(options);
        });
        // 缓存清理命令
        program
            .command('cache-clear')
            .description('清理缓存')
            .option('--all', '清空所有缓存')
            .action(async (options) => {
            await this.handleCacheClearCommand(options);
        });
        // 页面段落命令
        program
            .command('section')
            .description('获取萌娘百科页面指定标题或模板的内容')
            .argument('<identifier>', '页面ID或标题')
            .option('--id', '将参数作为页面ID处理')
            .option('-t, --titles <titles...>', '要获取的标题列表，支持部分匹配')
            .option('-p, --templates <templates...>', '要获取的模板名称列表，支持部分匹配')
            .option('-l, --limit <number>', '最大返回字符数', '5000')
            .option('--json', '输出 JSON 格式')
            .option('--no-cache', '不使用缓存')
            .action(async (identifier, options) => {
            await this.handleSectionCommand(identifier, options);
        });
        // 连接测试命令
        program
            .command('test')
            .description('测试萌娘百科API连接')
            .action(async () => {
            await this.handleTestCommand();
        });
    }
    /**
     * 处理搜索命令
     */
    async handleSearchCommand(keyword, options) {
        try {
            console.log(`🔍 正在搜索萌娘百科: ${keyword}`);
            console.log('='.repeat(40));
            const limit = parseInt(options.limit) || 5;
            const useCache = options.cache !== false;
            // 检查缓存
            if (useCache) {
                const cacheKey = CacheManager.buildSearchKey(keyword, limit);
                const cachedResult = this.cache.get(cacheKey);
                if (cachedResult && Array.isArray(cachedResult)) {
                    console.log('📋 使用缓存结果');
                    this.displaySearchResults(cachedResult, options.json);
                    return;
                }
            }
            // 执行搜索
            const searchParams = { keyword, limit };
            const results = await this.client.search(searchParams);
            if (options.json) {
                console.log(JSON.stringify(results, null, 2));
            }
            else {
                this.displaySearchResults(results, options.json);
            }
            // 缓存结果
            if (useCache && results.length > 0) {
                const cacheKey = CacheManager.buildSearchKey(keyword, limit);
                this.cache.set(cacheKey, results);
                console.log(`💾 结果已缓存`);
            }
        }
        catch (error) {
            console.error(`❌ 搜索失败: ${error}`);
            process.exit(1);
        }
    }
    /**
     * 处理页面获取命令
     */
    async handlePageCommand(identifier, options) {
        try {
            const useId = options.id || /^\d+$/.test(identifier);
            const useCache = options.cache !== false;
            const cleanContent = options.clean !== false;
            const maxLength = parseInt(options.limit) || 2000;
            console.log(`📖 正在获取页面: ${identifier} (${useId ? 'ID' : '标题'})`);
            console.log('='.repeat(40));
            // 检查缓存
            if (useCache) {
                const cacheKey = CacheManager.buildDocKey(identifier);
                const cachedPage = this.cache.get(cacheKey);
                if (cachedPage) {
                    console.log('📋 使用缓存页面');
                    this.displayPageContent(cachedPage, options.json, cleanContent, maxLength);
                    return;
                }
            }
            // 获取页面内容
            const pageParams = useId ?
                { pageid: parseInt(identifier) } :
                { title: identifier };
            const pageContent = await this.client.getPageContent(pageParams);
            if (!pageContent) {
                console.error(`❌ 页面获取失败: ${identifier}`);
                process.exit(1);
            }
            // 清理内容
            if (cleanContent) {
                pageContent.cleaned_content = WikiTextCleaner.clean(pageContent.content);
            }
            this.displayPageContent(pageContent, options.json, cleanContent, maxLength);
            // 缓存结果
            if (useCache) {
                const cacheKey = CacheManager.buildDocKey(identifier);
                this.cache.set(cacheKey, pageContent);
                console.log(`💾 页面已缓存`);
            }
        }
        catch (error) {
            console.error(`❌ 页面获取失败: ${error}`);
            process.exit(1);
        }
    }
    /**
     * 处理缓存统计命令
     */
    async handleCacheStatsCommand(options) {
        const stats = this.cache.getStats();
        if (options.json) {
            console.log(JSON.stringify(stats, null, 2));
        }
        else {
            console.log('📊 缓存统计信息');
            console.log('='.repeat(20));
            console.log(`总条目数: ${stats.total_entries}`);
            console.log(`缓存命中: ${stats.cache_hits}`);
            console.log(`缓存未命中: ${stats.cache_misses}`);
            console.log(`命中率: ${(stats.hit_rate * 100).toFixed(2)}%`);
        }
    }
    /**
     * 处理缓存清理命令
     */
    async handleCacheClearCommand(options) {
        let cleanedCount = 0;
        if (options.all) {
            const size = this.cache.size();
            this.cache.clear();
            cleanedCount = size;
            console.log(`🧹 已清空所有缓存 (${cleanedCount} 项)`);
        }
        else {
            cleanedCount = this.cache.cleanup();
            console.log(`🧹 已清理过期缓存 (${cleanedCount} 项)`);
        }
    }
    /**
     * 处理连接测试命令
     */
    async handleTestCommand() {
        console.log('🔗 测试萌娘百科API连接...');
        console.log('='.repeat(30));
        try {
            const isConnected = await this.client.checkConnection();
            if (isConnected) {
                console.log('✅ API连接正常');
                // 执行一个简单搜索测试
                console.log('\n🔍 执行搜索测试...');
                const testResults = await this.client.search({ keyword: '测试', limit: 1 });
                if (testResults.length > 0) {
                    console.log('✅ 搜索功能正常');
                    console.log(`   找到 ${testResults.length} 个结果`);
                }
                else {
                    console.log('⚠️ 搜索功能异常（无结果）');
                }
            }
            else {
                console.log('❌ API连接失败');
                process.exit(1);
            }
        }
        catch (error) {
            console.error(`❌ 连接测试失败: ${error}`);
            process.exit(1);
        }
    }
    /**
     * 显示搜索结果
     */
    displaySearchResults(results, jsonFormat) {
        if (jsonFormat) {
            console.log(JSON.stringify(results, null, 2));
            return;
        }
        if (!results || results.length === 0) {
            console.log('❌ 未找到相关条目');
            return;
        }
        console.log(`🔍 搜索结果 (${results.length} 个):\n`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.title}`);
            console.log(`   页面ID: ${result.pageid}`);
            console.log(`   链接: ${result.url}`);
            if (result.snippet) {
                // 移除HTML标签
                const cleanSnippet = result.snippet.replace(/<[^>]*>/g, '');
                console.log(`   摘要: ${cleanSnippet}`);
            }
            console.log('');
        });
    }
    /**
     * 显示页面内容
     */
    displayPageContent(page, jsonFormat, cleanContent, maxLength = 2000) {
        if (jsonFormat) {
            console.log(JSON.stringify(page, null, 2));
            return;
        }
        // 解析页面结构以获取目录
        const structure = PageContentParser.parsePage(page.title, page.content);
        // 显示目录
        if (structure.toc && structure.headings.length > 0) {
            console.log(structure.toc);
            console.log();
        }
        const content = cleanContent ? page.cleaned_content || page.content : page.content;
        console.log(`📖 ${page.title}`);
        console.log('='.repeat(page.title.length + 3));
        console.log(`页面ID: ${page.pageid}`);
        console.log(`内容长度: ${content.length} 字符`);
        console.log(`清理状态: ${cleanContent ? '已清理' : '原始'}\n`);
        // 限制显示长度
        if (content.length > maxLength) {
            console.log(content.substring(0, maxLength));
            const remaining = content.length - maxLength;
            console.log(`\n... (剩余 ${remaining} 字符未显示，可使用 section 命令获取特定部分内容)`);
        }
        else {
            console.log(content);
            console.log(`\n(完整内容，共 ${content.length} 字符)`);
        }
    }
    /**
     * 处理页面段落命令
     */
    async handleSectionCommand(identifier, options) {
        try {
            const useId = options.id || /^\d+$/.test(identifier);
            const useCache = options.cache !== false;
            const sectionTitles = options.titles || [];
            const templateNames = options.templates || [];
            const maxLength = parseInt(options.limit) || 5000;
            if (sectionTitles.length === 0 && templateNames.length === 0) {
                console.error('❌ 必须提供 --titles 或 --templates 参数');
                process.exit(1);
            }
            console.log(`📖 正在获取页面段落: ${identifier} (${useId ? 'ID' : '标题'})`);
            if (sectionTitles.length > 0) {
                console.log(`标题: ${sectionTitles.join(', ')}`);
            }
            if (templateNames.length > 0) {
                console.log(`模板: ${templateNames.join(', ')}`);
            }
            console.log('='.repeat(50));
            // 检查缓存
            if (useCache) {
                const cacheKey = CacheManager.buildDocKey(identifier);
                const cachedPage = this.cache.get(cacheKey);
                if (cachedPage) {
                    console.log('📋 使用缓存页面');
                    this.displayPageSections(cachedPage, sectionTitles, templateNames, maxLength, options.json);
                    return;
                }
            }
            // 获取页面内容
            const pageParams = useId ?
                { pageid: parseInt(identifier) } :
                { title: identifier };
            const pageContent = await this.client.getPageContent(pageParams);
            if (!pageContent) {
                console.error(`❌ 页面获取失败: ${identifier}`);
                process.exit(1);
            }
            this.displayPageSections(pageContent, sectionTitles, templateNames, maxLength, options.json);
            // 缓存结果
            if (useCache) {
                const cacheKey = CacheManager.buildDocKey(identifier);
                this.cache.set(cacheKey, pageContent);
                console.log(`💾 页面已缓存`);
            }
        }
        catch (error) {
            console.error(`❌ 页面段落获取失败: ${error}`);
            process.exit(1);
        }
    }
    /**
     * 显示页面段落
     */
    displayPageSections(page, sectionTitles, templateNames, maxLength, jsonFormat) {
        const structure = PageContentParser.parsePage(page.title, page.content);
        if (jsonFormat) {
            const results = {
                page: page.title,
                requested_sections: {
                    titles: sectionTitles,
                    templates: templateNames
                },
                content: {}
            };
            // 获取指定标题的内容
            for (const titleQuery of sectionTitles) {
                const content = PageContentParser.getContentByTitle(structure, titleQuery);
                if (content) {
                    results.content[titleQuery] = content;
                }
            }
            // 获取指定模板的内容
            for (const templateQuery of templateNames) {
                const templates = PageContentParser.findTemplatesByName(structure, templateQuery);
                if (templates.length > 0) {
                    results.content[templateQuery] = templates.map(t => ({
                        name: t.name,
                        fullText: t.fullText,
                        parameters: Object.fromEntries(t.parameters)
                    }));
                }
            }
            console.log(JSON.stringify(results, null, 2));
            return;
        }
        // 收集请求的内容
        const results = [];
        // 获取指定标题的内容
        for (const titleQuery of sectionTitles) {
            const content = PageContentParser.getContentByTitle(structure, titleQuery);
            if (content) {
                results.push(`📖 ${titleQuery}\n${'='.repeat(titleQuery.length + 3)}\n\n${content}`);
            }
        }
        // 获取指定模板的内容
        for (const templateQuery of templateNames) {
            const templates = PageContentParser.findTemplatesByName(structure, templateQuery);
            for (const template of templates) {
                results.push(`🔧 模板: ${template.name}\n${'='.repeat(template.name.length + 5)}\n\n${template.fullText}`);
            }
        }
        if (results.length === 0) {
            console.log(`❌ 未找到匹配的标题或模板`);
            console.log(`搜索的标题: ${sectionTitles.join(', ')}`);
            console.log(`搜索的模板: ${templateNames.join(', ')}`);
            return;
        }
        const combinedContent = results.join('\n\n' + '-'.repeat(50) + '\n\n');
        // 限制内容长度
        if (combinedContent.length > maxLength) {
            console.log(combinedContent.substring(0, maxLength));
            const remaining = combinedContent.length - maxLength;
            console.log(`\n... (剩余 ${remaining} 字符未显示)`);
        }
        else {
            console.log(combinedContent);
        }
    }
}
//# sourceMappingURL=commands.js.map