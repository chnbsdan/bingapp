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
    const chinaData = allData.find(item => item.lang === 'zh-CN');

    if (!chinaData) {
        console.log('⚠️ 未找到中国区数据');
        return null;
    }

    const dateKey = chinaData.date.replace(/-/g, '');
    return {
        key: dateKey,
        data: {
            url: chinaData.url,
            date: chinaData.date,
            title: chinaData.title,
            copyright: chinaData.copyright,
            copyrightlink: chinaData.copyrightlink || '',
        }
    };
}

async function main() {
    try {
        console.log(`🔄 开始更新中国区数据...`);

        const result = await fetchChinaData();
        if (!result) {
            console.log('❌ 未获取到数据，退出');
            process.exit(0);
        }

        const { key, data } = result;
        console.log(`📥 中国区日期: ${key}`);

        // 读取现有数据
        let existingData = {};
        if (fs.existsSync(dataFilePath)) {
            try {
                const content = fs.readFileSync(dataFilePath, 'utf-8');
                if (content && content.trim()) {
                    existingData = JSON.parse(content);
                    console.log(`📂 现有数据包含 ${Object.keys(existingData).length} 天`);
                }
            } catch (e) {
                console.log(`⚠️ 读取文件失败: ${e.message}`);
            }
        } else {
            console.log('📂 data.json 不存在，将创建新文件');
        }

        // 检查是否已存在
        if (existingData[key]) {
            console.log(`⏭️ ${key} 已存在，跳过`);
            process.exit(0);
        }

        // 追加新数据
        existingData[key] = data;
        console.log(`✅ 新增: ${key}`);

        // 按日期排序（最新的在前）
        const sortedData = {};
        Object.keys(existingData)
            .sort((a, b) => b.localeCompare(a))
            .forEach(k => {
                sortedData[k] = existingData[k];
            });

        // ========== 关键修改：压缩格式写入（不传空格参数） ==========
        fs.writeFileSync(dataFilePath, JSON.stringify(sortedData));
        console.log(`💾 已保存（压缩格式），总计 ${Object.keys(sortedData).length} 天`);

    } catch (error) {
        console.error('❌ 更新失败:', error);
        process.exit(1);
    }
}

main();
