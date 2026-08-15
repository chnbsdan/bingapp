// server/api/china-history.get.ts
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async () => {
    // 使用绝对路径，确保在不同环境下都能找到文件
    const dataPath = path.resolve(process.cwd(), 'archive', 'data.json');

    try {
        // 1. 检查文件是否存在
        await fs.access(dataPath);
        console.log('✅ data.json 文件存在');

        // 2. 读取文件
        const data = await readFile(dataPath, 'utf-8');
        console.log(`📄 文件大小: ${data.length} 字节`);

        // 3. 解析 JSON
        const parsed = JSON.parse(data);
        console.log(`✅ JSON 解析成功，数据类型: ${Array.isArray(parsed) ? '数组' : typeof parsed}`);

        // 4. 处理数据
        let result = parsed;
        if (!Array.isArray(parsed)) {
            result = Object.keys(parsed)
                .sort((a, b) => b.localeCompare(a))
                .map(key => ({
                    startdate: parsed[key].startdate || key,
                    urlbase: parsed[key].urlbase || parsed[key].url || '',
                    title: parsed[key].title || '',
                    copyright: parsed[key].copyright || '',
                }));
        }

        console.log(`✅ 成功返回 ${result.length} 条数据`);
        return result;

    } catch (error) {
        // 详细记录错误信息
        console.error('❌ 读取中国历史数据失败:', error.message);
        console.error('   文件路径:', dataPath);
        console.error('   错误堆栈:', error.stack);
        return []; // 返回空数组
    }
});
