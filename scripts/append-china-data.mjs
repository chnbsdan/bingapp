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

    console.log(`📡 请求API: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }

    const allData = await response.json();

    // 通过 lang 字段查找中国区数据
    const chinaData = allData.find(item => item.lang === 'zh-CN');

    if (!chinaData) {
        console.log('⚠️ 未找到中国区数据 (lang=zh-CN)');
        return null;
    }

    return chinaData;
}

async function main() {
    try {
        console.log(`🔄 开始更新中国区数据...`);

        const newData = await fetchChinaData();
        if (!newData) {
            console.log('❌ 未获取到数据，退出');
            process.exit(0);
        }

        // ========== 关键修改：将日期转换为 YYYYMMDD 格式 ==========
        let dateStr = newData.date;
        if (dateStr) {
            // 移除连字符: 2026-08-15 -> 20260815
            dateStr = dateStr.replace(/-/g, '');
        } else {
            // 如果没有日期，使用当前日期
            const now = new Date();
            dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            console.log(`⚠️ 未找到日期字段，使用当前日期: ${dateStr}`);
        }

        console.log(`📥 中国区日期: ${dateStr}`);

        // 读取现有 data.json
        let existingData = {};
        if (fs.existsSync(dataFilePath)) {
            const content = fs.readFileSync(dataFilePath, 'utf-8');
            existingData = JSON.parse(content);
            console.log(`📂 现有数据包含 ${Object.keys(existingData).length} 天`);
            
            // 打印前5个键，确认格式
            const keys = Object.keys(existingData).slice(0, 5);
            console.log(`📋 现有数据键示例: ${keys.join(', ')}`);
        } else {
            console.log('📂 data.json 不存在，将创建新文件');
        }

        // ========== 关键修改：用 YYYYMMDD 格式检查是否已存在 ==========
        if (existingData[dateStr]) {
            console.log(`⏭️ ${dateStr} 已存在，跳过`);
            process.exit(0);
        }

        // 构建要保存的数据（移除 date 字段，添加 startdate）
        const dataToSave = {
            startdate: dateStr,
            urlbase: newData.url,
            title: newData.title,
            copyright: newData.copyright,
            copyrightlink: newData.copyrightlink,
        };

        // 追加新数据
        existingData[dateStr] = dataToSave;
        console.log(`✅ 新增: ${dateStr}`);

        // 按日期排序（最新的在前）
        const sortedData = Object.keys(existingData)
            .sort((a, b) => b.localeCompare(a))
            .reduce((acc, key) => {
                acc[key] = existingData[key];
                return acc;
            }, {});

        // 写入文件
        fs.writeFileSync(dataFilePath, JSON.stringify(sortedData, null, 2));
        console.log(`💾 已保存到 ${dataFilePath}`);
        console.log(`📊 总计 ${Object.keys(sortedData).length} 天的中国区数据`);

    } catch (error) {
        console.error('❌ 更新失败:', error);
        process.exit(1);
    }
}

main();
