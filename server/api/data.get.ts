// server/api/data.get.ts
import { readFileSync } from 'node:fs';
import path from 'node:path';

export default defineEventHandler(() => {
    try {
        // 读取 archive/data.json
        const dataPath = path.resolve(process.cwd(), 'archive', 'data.json');
        const content = readFileSync(dataPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('读取 data.json 失败:', error);
        return [];
    }
});
