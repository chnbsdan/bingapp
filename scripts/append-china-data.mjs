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
    console.log(`📊 API返回 ${allData.length} 条数据`);

    // 打印第一条完整数据结构，查看所有字段
    if (allData.length > 0) {
        console.log('📋 第一条数据结构:', JSON.stringify(allData[0], null, 2));
    }

    // 遍历打印所有数据的 lang 和日期字段
    allData.forEach((item, index) => {
        // 尝试找出日期字段 - 可能是 date, startdate, enddate, 或其他
        const dateFields = Object.keys(item).filter(key => 
            key.includes('date') || key.includes('Date') || key === 'startdate' || key === 'enddate'
        );
        console.log(`  [${index}] lang: ${item.lang}, 日期字段: ${dateFields.join(', ')}, 值: ${dateFields.map(f => item[f]).join(', ')}`);
    });

    // 通过 lang 字段查找中国区数据
    const chinaData = allData.find(item => item.lang === 'zh-CN');

    if (!chinaData) {
        console.log('⚠️ 未找到中国区数据 (lang=zh-CN)');
        return null;
    }

    console.log('✅ 找到中国区数据，完整内容:', JSON.stringify(chinaData, null, 2));
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

        // 找出正确的日期字段
        const dateKeys = Object.keys(newData).filter(key => 
            key.includes('date') || key.includes('Date') || key === 'startdate' || key === 'enddate'
        );
        
        let startdate = newData.startdate || newData.date || newData.enddate;
        // 如果日期是 Date 对象，转换为字符串
        if (startdate instanceof Date) {
            startdate = startdate.toISOString().slice(0, 10).replace(/-/g, '');
        }

        console.log(`📥 获取到中国区数据，日期字段: ${dateKeys.join(', ')}, 值: ${startdate}`);

        // 如果还是没有日期，使用当前日期
        if (!startdate) {
            const now = new Date();
            startdate = now.toISOString().slice(0, 10).replace(/-/g, '');
            console.log(`⚠️ 未找到日期字段，使用当前日期: ${startdate}`);
        }

        // 读取现有 data.json
        let existingData = {};
        if (fs.existsSync(dataFilePath)) {
            const content = fs.readFileSync(dataFilePath, 'utf-8');
            existingData = JSON.parse(content);
            console.log(`📂 现有数据包含 ${Object.keys(existingData).length} 天`);
        } else {
            console.log('📂 data.json 不存在，将创建新文件');
        }

        // 检查是否已存在
        if (existingData[startdate]) {
            console.log(`⏭️ ${startdate} 已存在，跳过`);
            process.exit(0);
        }

        // 追加新数据
        existingData[startdate] = newData;
        console.log(`✅ 新增: ${startdate}`);

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
