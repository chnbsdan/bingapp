// server/api/china-history.get.ts
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async () => {
    try {
        // 读取 archive/data.json 文件
        const dataPath = path.resolve(process.cwd(), 'archive', 'data.json');
        const data = await readFile(dataPath, 'utf-8');
        const parsedData = JSON.parse(data);
        
        // 如果是数组格式，直接返回；如果是对象格式，转换为数组
        let result = parsedData;
        if (!Array.isArray(parsedData)) {
            // 对象格式 { "20260815": {...}, ... } 转换为数组
            result = Object.keys(parsedData)
                .sort((a, b) => b.localeCompare(a))
                .map(key => ({
                    startdate: parsedData[key].startdate || key,
                    urlbase: parsedData[key].urlbase || parsedData[key].url || '',
                    title: parsedData[key].title || '',
                    copyright: parsedData[key].copyright || '',
                }));
        }
        
        return result;
    } catch (error) {
        console.error('读取中国历史数据失败:', error);
        return [];
    }
});
