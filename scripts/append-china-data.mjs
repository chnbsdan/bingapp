// scripts/append-china-data.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const archiveDataPath = path.join(rootDir, 'archive', 'data.json');
const publicDataPath = path.join(rootDir, 'public', 'data', 'data.json');

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

    const dateStr = chinaData.date.replace(/-/g, '');
    return {
        startdate: dateStr,
        urlbase: chinaData.url,
        title: chinaData.title,
        copyright: chinaData.copyright,
    };
}

function writeDataFile(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data));
    console.log(`💾 已写入: ${filePath}`);
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

        // ========== 更新 archive/data.json ==========
        let archiveData = [];
        if (fs.existsSync(archiveDataPath)) {
            const content = fs.readFileSync(archiveDataPath, 'utf-8');
            archiveData = JSON.parse(content);
            if (!Array.isArray(archiveData)) {
                archiveData = [];
            }
            console.log(`📂 archive 现有 ${archiveData.length} 条`);
        }

        if (!archiveData.some(item => item.startdate === dateStr)) {
            archiveData.push(newData);
            archiveData.sort((a, b) => b.startdate.localeCompare(a.startdate));
            writeDataFile(archiveDataPath, archiveData);
            console.log(`✅ archive/data.json 新增: ${dateStr}`);
        } else {
            console.log(`⏭️ archive/data.json 中 ${dateStr} 已存在`);
        }

        // ========== 同步更新 public/data/data.json ==========
        let publicData = [];
        if (fs.existsSync(publicDataPath)) {
            try {
                const content = fs.readFileSync(publicDataPath, 'utf-8');
                publicData = JSON.parse(content);
                if (!Array.isArray(publicData)) {
                    console.log('⚠️ public/data/data.json 不是数组，重新创建');
                    publicData = [];
                } else {
                    console.log(`📂 public 现有 ${publicData.length} 条`);
                }
            } catch (e) {
                console.log(`⚠️ 读取 public/data/data.json 失败: ${e.message}`);
                publicData = [];
            }
        } else {
            console.log('📂 public/data/data.json 不存在，将创建');
        }

        // 如果 archive 有数据但 public 为空，从 archive 同步
        if (publicData.length === 0 && archiveData.length > 0) {
            console.log(`📂 从 archive 同步 ${archiveData.length} 条到 public`);
            publicData = JSON.parse(JSON.stringify(archiveData));
        }

        // 检查是否已存在
        if (!publicData.some(item => item.startdate === dateStr)) {
            publicData.push(newData);
            publicData.sort((a, b) => b.startdate.localeCompare(a.startdate));
            writeDataFile(publicDataPath, publicData);
            console.log(`✅ public/data/data.json 新增: ${dateStr}`);
        } else {
            console.log(`⏭️ public/data/data.json 中 ${dateStr} 已存在`);
        }

        console.log(`📊 完成！archive: ${archiveData.length} 条, public: ${publicData.length} 条`);

    } catch (error) {
        console.error('❌ 更新失败:', error);
        process.exit(1);
    }
}

main();
