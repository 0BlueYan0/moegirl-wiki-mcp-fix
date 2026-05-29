/**
 * 页面内容解析器
 * 用于解析萌娘百科页面内容，提取标题、模板和结构化信息
 */
import { PageSection, PageTemplate, PageStructure } from '../types/index.js';
export declare class PageContentParser {
    /**
     * 解析页面内容，提取结构化信息
     * @param title 页面标题
     * @param content 页面内容
     * @returns 页面结构对象
     */
    static parsePage(title: string, content: string): PageStructure;
    /**
     * 提取模板名称
     * @param line 模板开始行
     * @returns 模板名称
     */
    private static extractTemplateName;
    /**
     * 判断模板是否完整（是否已经正确结束）
     * @param content 模板内容
     * @returns 是否完整
     */
    private static isTemplateComplete;
    /**
     * 判断是否是有效的模板开始
     * @param line 行内容
     * @returns 是否是有效模板开始
     */
    private static isValidTemplateStart;
    /**
     * 提取模板参数
     * @param templateText 模板完整文本
     * @returns 参数映射
     */
    private static extractTemplateParameters;
    /**
     * 分割模板参数（处理嵌套的模板和链接）
     * @param content 模板内容
     * @returns 参数数组
     */
    private static splitTemplateParams;
    /**
     * 生成目录
     * @param headings 标题列表
     * @returns 目录字符串
     */
    private static generateTOC;
    /**
     * 根据标题查找section
     * @param structure 页面结构
     * @param title 标题名称（支持部分匹配）
     * @returns 匹配的sections
     */
    static findSectionsByTitle(structure: PageStructure, title: string): PageSection[];
    /**
     * 根据模板名称查找template
     * @param structure 页面结构
     * @param templateName 模板名称（支持部分匹配）
     * @returns 匹配的templates
     */
    static findTemplatesByName(structure: PageStructure, templateName: string): PageTemplate[];
    /**
     * 获取指定标题下的内容
     * @param structure 页面结构
     * @param title 标题名称
     * @returns 标题下的内容
     */
    static getContentByTitle(structure: PageStructure, title: string): string;
}
//# sourceMappingURL=page_content_parser.d.ts.map