// scripts/append-china-data.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataFilePath = path.join(rootDir, 'archive', 'data.json');

async function fetchChinaData() {
    const apiEndpoint = process.env.API_ENDPOINT || 'https://bing.api.hangdn.com';
    const url = `${apiEndpoint}/api/updates?idx=0`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API请求失败: ${response.status}`);

    const allData = await response.json();
    const chinaData = allData.find(item => item.lang === 'zh-CN');
    if (!chinaData) throw new Error('未找到中国区数据');

    const dateStr = chinaData.date.replace(/-/g, '');
    return {
        startdate: dateStr,
        urlbase: chinaData.url,
        title: chinaData.title,
        copyright: chinaData.copyright,
    };
}

async function main() {
    try {
        const newData = await fetchChinaData();
        const dateStr = newData.startdate;
        console.log(`📥 中国区日期: ${dateStr}`);

        // 读取现有数据
        let existingData = [];
        if (fs.existsSync(dataFilePath)) {
            const content = fs.readFileSync(dataFilePath, 'utf-8');
            existingData = JSON.parse(content);
            if (!Array.isArray(existingData)) {
                console.error('❌ data.json 不是数组格式，请检查文件');
                process.exit(1);
            }
            console.log(`📂 现有 ${existingData.length} 条记录`);
        } else {
            console.log('📂 data.json 不存在，创建新文件');
        }

        // 检查是否已存在
        if (existingData.some(item => item.startdate === dateStr)) {
            console.log(`⏭️ ${dateStr} 已存在，跳过`);
            process.exit(0);
        }

        // 追加并排序
        existingData.push(newData);
        existingData.sort((a, b) => b.startdate.localeCompare(a.startdate));

        fs.writeFileSync(dataFilePath, JSON.stringify(existingData));
        console.log(`✅ 已保存，共 ${existingData.length} 条`);

    } catch (error) {
        console.error('❌ 失败:', error.message);
        process.exit(1);
    }
}

main();
