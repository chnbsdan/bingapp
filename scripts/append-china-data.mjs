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

    // 转换为与 data.json 一致的格式
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
        console.log(`🔄 开始更新中国区数据...`);

        const newData = await fetchChinaData();
        if (!newData) {
            console.log('❌ 未获取到数据，退出');
            process.exit(0);
        }

        const dateStr = newData.startdate;
        console.log(`📥 中国区日期: ${dateStr}`);

        // 读取现有 data.json（数组格式）
        let existingData = [];
        if (fs.existsSync(dataFilePath)) {
            try {
                const content = fs.readFileSync(dataFilePath, 'utf-8');
                if (content && content.trim()) {
                    existingData = JSON.parse(content);
                    if (!Array.isArray(existingData)) {
                        console.log('⚠️ data.json 不是数组格式，将重新创建');
                        existingData = [];
                    } else {
                        console.log(`📂 现有数据包含 ${existingData.length} 条记录`);
                    }
                }
            } catch (e) {
                console.log(`⚠️ 读取文件失败: ${e.message}，将重新创建`);
                existingData = [];
            }
        } else {
            console.log('📂 data.json 不存在，将创建新文件');
        }

        // 检查是否已存在该日期
        const exists = existingData.some(item => item.startdate === dateStr);
        if (exists) {
            console.log(`⏭️ ${dateStr} 已存在，跳过`);
            process.exit(0);
        }

        // 追加新数据
        existingData.push(newData);
        console.log(`✅ 新增: ${dateStr}`);

        // 按 startdate 排序（最新的在前）
        existingData.sort((a, b) => b.startdate.localeCompare(a.startdate));

        // 写入文件（压缩格式）
        fs.writeFileSync(dataFilePath, JSON.stringify(existingData));
        console.log(`💾 已保存，总计 ${existingData.length} 条记录`);

    } catch (error) {
        console.error('❌ 更新失败:', error);
        process.exit(1);
    }
}

main();
